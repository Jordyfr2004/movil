import React, { useCallback, useMemo, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useStripe } from "@stripe/stripe-react-native";

import { AppButton } from "../components/AppButton";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { ErrorMessage } from "../components/ErrorMessage";
import { LoadingState } from "../components/LoadingState";
import { Screen } from "../components/Screen";
import { StatusBadge } from "../components/StatusBadge";
import { spacing } from "../constants/spacing";
import { STRIPE_PUBLISHABLE_KEY } from "../constants/stripe";
import { useAuth } from "../context/AuthContext";
import { useReservations } from "../hooks/useReservations";
import { ROUTES } from "../navigation/routes";
import { RootStackParamList } from "../navigation/types";
import { createPaymentIntent } from "../services/paymentService";
import { cancelReservation } from "../services/reservationService";
import { colors, typography } from "../theme";
import { formatReservationDate } from "../utils/date";

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.MyReservations
>;

export function MyReservationsScreen({}: Props) {
  const { accessToken } = useAuth();
  const { reservations, loading, error, reload } = useReservations(accessToken);
  const [isCancelling, setIsCancelling] = useState(false);
  const [payingReservationId, setPayingReservationId] = useState<string | null>(
    null
  );
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const activeCount = useMemo(() => {
    return reservations.filter(
      (reservation) =>
        reservation.status === "confirmed" ||
        reservation.status === "pending_payment"
    ).length;
  }, [reservations]);

  const getStatusBadge = (status: (typeof reservations)[number]["status"]) => {
    switch (status) {
      case "confirmed":
        return { label: "Confirmada", tone: "success" as const };
      case "pending_payment":
        return { label: "Pendiente de pago", tone: "success" as const };
      case "completed":
        return { label: "Completada", tone: "success" as const };
      case "expired":
        return { label: "Expirada", tone: "danger" as const };
      case "cancelled":
      default:
        return { label: "Cancelada", tone: "danger" as const };
    }
  };

  const handleCancel = async (reservationId: string) => {
    if (isCancelling) {
      return;
    }

    if (!accessToken) {
      Alert.alert("Sesión requerida", "Inicia sesión para cancelar una reserva.");
      return;
    }

    try {
      setIsCancelling(true);
      await cancelReservation(accessToken, reservationId);
      await reload();
    } catch (error: any) {
      Alert.alert("Error", error?.message || "No se pudo cancelar la reserva");
    } finally {
      setIsCancelling(false);
    }
  };

  const confirmCancel = (reservationId: string) => {
    Alert.alert(
      "Cancelar reserva",
      "Esta acción cancelará tu reserva. ¿Deseas continuar?",
      [
        { text: "Volver", style: "cancel" },
        {
          text: "Cancelar",
          style: "destructive",
          onPress: () => handleCancel(reservationId),
        },
      ]
    );
  };

  const handlePay = async (reservationId: string) => {
    if (payingReservationId) {
      return;
    }

    if (!STRIPE_PUBLISHABLE_KEY) {
      Alert.alert(
        "Falta configurar Stripe",
        "Define EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY (pk_test_...) y reinicia la app."
      );
      return;
    }

    if (!accessToken) {
      Alert.alert("Sesión requerida", "Inicia sesión para pagar la reserva.");
      return;
    }

    try {
      setPayingReservationId(reservationId);

      const intent = await createPaymentIntent(accessToken, reservationId);
      if (!intent.clientSecret) {
        throw new Error("No se recibió clientSecret del servidor");
      }

      const init = await initPaymentSheet({
        merchantDisplayName: "Movil",
        paymentIntentClientSecret: intent.clientSecret,
      });

      if (init.error) {
        throw new Error(init.error.message);
      }

      const presented = await presentPaymentSheet();
      if (presented.error) {
        throw new Error(presented.error.message);
      }

      Alert.alert("Pago completado", "Pago realizado. Actualizando reserva…");
      await reload();
    } catch (error: any) {
      Alert.alert("Error", error?.message || "No se pudo completar el pago");
    } finally {
      setPayingReservationId(null);
    }
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis reservas</Text>
        <Text style={styles.subtitle}>
          {loading
            ? "Cargando tus reservas…"
            : activeCount > 0
              ? `Tienes ${activeCount} reserva${activeCount === 1 ? "" : "s"} activa${activeCount === 1 ? "" : "s"}.`
              : "No tienes reservas activas por ahora."}
        </Text>
      </View>

      <FlatList
        data={reservations}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.title}
              </Text>
              {(() => {
                const badge = getStatusBadge(item.status);
                return <StatusBadge label={badge.label} tone={badge.tone} />;
              })()}
            </View>

            <Text style={styles.cardSubtitle} numberOfLines={1}>
              {item.restaurantName}
            </Text>
            <Text style={styles.cardDate}>
              {formatReservationDate(item.reservationDate)}
            </Text>

            {item.status === "confirmed" || item.status === "pending_payment" ? (
              <View style={styles.cardFooter}>
                {item.status === "pending_payment" ? (
                  <AppButton
                    label={
                      payingReservationId === item.id ? "Procesando…" : "Pagar"
                    }
                    onPress={() => handlePay(item.id)}
                    variant="primary"
                    size="sm"
                    disabled={Boolean(payingReservationId) || isCancelling}
                  />
                ) : null}
                {item.status === "pending_payment" ? (
                  <AppButton
                    label={isCancelling ? "Cancelando…" : "Cancelar"}
                    onPress={() => confirmCancel(item.id)}
                    variant="danger"
                    size="sm"
                    disabled={isCancelling || payingReservationId === item.id}
                  />
                ) : null}
              </View>
            ) : null}
          </Card>
        )}
        ListEmptyComponent={
          loading ? (
            <LoadingState
              message="Espera un momento mientras actualizamos la información."
              style={styles.feedbackState}
            />
          ) : error ? (
            <ErrorMessage
              title="No se pudieron cargar las reservas"
              message={error}
              onRetry={reload}
              style={styles.feedbackState}
            />
          ) : (
            <EmptyState
              title="Aún no tienes reservas"
              message="Cuando reserves platos, aparecerán aquí."
              iconName="calendar-blank-outline"
              style={styles.feedbackState}
            />
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeights.xl,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.md,
  },
  listContent: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeights.md,
  },
  cardSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  cardDate: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  cardFooter: {
    marginTop: spacing.lg,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
  },
  feedbackState: {
    marginTop: spacing.sm,
  },
});
