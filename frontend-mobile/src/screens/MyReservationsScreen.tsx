import React, { useCallback, useMemo, useState } from "react";
import { Alert, FlatList, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useStripe } from "@stripe/stripe-react-native";

import {
  MyReservationCard,
  MyReservationsFeedback,
  MyReservationsHeader,
} from "../components/myReservations";
import { Screen } from "../components/Screen";
import { spacing } from "../constants/spacing";
import { STRIPE_PUBLISHABLE_KEY } from "../constants/stripe";
import { useAuth } from "../context/AuthContext";
import { useReservations } from "../hooks/useReservations";
import { ROUTES } from "../navigation/routes";
import { RootStackParamList } from "../navigation/types";
import { createPaymentIntent } from "../services/paymentService";
import { cancelReservation } from "../services/reservationService";

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
      <MyReservationsHeader activeCount={activeCount} loading={loading} />

      <FlatList
        data={reservations}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <MyReservationCard
            isCancelling={isCancelling}
            isPaymentInProgress={Boolean(payingReservationId)}
            isPaying={payingReservationId === item.id}
            reservation={item}
            onCancel={confirmCancel}
            onPay={handlePay}
          />
        )}
        ListEmptyComponent={
          <MyReservationsFeedback
            error={error}
            loading={loading}
            onRetry={reload}
            style={styles.feedbackState}
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  feedbackState: {
    marginTop: spacing.sm,
  },
});
