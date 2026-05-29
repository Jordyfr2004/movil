import React, { useCallback, useMemo, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { ROUTES } from "../navigation/routes";
import { Screen } from "../components/Screen";
import { StatusBadge } from "../components/StatusBadge";
import { AppButton } from "../components/AppButton";
import { useReservations } from "../hooks/useReservations";
import { cancelReservation } from "../services/reservationService";
import { formatReservationDate } from "../utils/date";
import { colors, typography } from "../theme";
import { spacing } from "../constants/spacing";
import { useAuth } from "../context/AuthContex";
import { useStripe } from "@stripe/stripe-react-native";
import { STRIPE_PUBLISHABLE_KEY } from "../constants/stripe";
import { createPaymentIntent } from "../services/paymentService";

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.MyReservations
>;

export function MyReservationsScreen({}: Props) {
  const { accessToken } = useAuth();
  const { reservations, loading, reload } = useReservations(accessToken);
  const [isCancelling, setIsCancelling] = useState(false);
  const [payingReservationId, setPayingReservationId] = useState<string | null>(null);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const activeCount = useMemo(() => {
    return reservations.filter(
      (r) => r.status === "confirmed" || r.status === "pending_payment"
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
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.title}
              </Text>
              {(() => {
                const badge = getStatusBadge(item.status);
                return (
                  <StatusBadge
                    label={badge.label}
                    tone={badge.tone}
                  />
                );
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
                <AppButton
                  label={isCancelling ? "Cancelando…" : "Cancelar"}
                  onPress={() => confirmCancel(item.id)}
                  variant="danger"
                  size="sm"
                  disabled={isCancelling}
                />
              </View>
            ) : null}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>
              {loading ? "Cargando reservas…" : "Aún no tienes reservas"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {loading
                ? "Espera un momento mientras actualizamos la información."
                : "Cuando reserves platos, aparecerán aquí."}
            </Text>
          </View>
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 1,
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
  emptyCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
  emptyTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
});
