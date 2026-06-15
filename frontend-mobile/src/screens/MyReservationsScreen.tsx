import React, { useCallback, useMemo, useState } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useStripe } from "@stripe/stripe-react-native";
import Svg, { Path } from "react-native-svg";

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
import { studentPalette } from "../theme/studentPalette";

type UnknownRecord = Record<string, unknown>;

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.MyReservations
>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function readErrorMessage(error: unknown, fallback: string): string {
  if (!isRecord(error)) {
    return fallback;
  }

  return typeof error.message === "string" && error.message
    ? error.message
    : fallback;
}

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
    } catch (error: unknown) {
      Alert.alert(
        "Error",
        readErrorMessage(error, "No se pudo cancelar la reserva")
      );
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
    } catch (error: unknown) {
      Alert.alert(
        "Error",
        readErrorMessage(error, "No se pudo completar el pago")
      );
    } finally {
      setPayingReservationId(null);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <MyReservationsFeedback
          error={null}
          loading
          onRetry={reload}
          style={styles.feedbackState}
        />
      );
    }

    if (error) {
      return (
        <MyReservationsFeedback
          error={error}
          loading={false}
          onRetry={reload}
          style={styles.feedbackState}
        />
      );
    }

    if (reservations.length === 0) {
      return (
        <MyReservationsFeedback
          error={null}
          loading={false}
          onRetry={reload}
          style={styles.feedbackState}
        />
      );
    }

    return (
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
      />
    );
  };

  return (
    <Screen style={styles.container}>
      <View
        style={styles.backgroundDecor}
        pointerEvents="none"
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Svg
          width="100%"
          height={150}
          viewBox="0 0 360 150"
          preserveAspectRatio="none"
          style={styles.backgroundWave}
        >
          <Path
            d="M0 0 H360 V70 C298 105 233 43 160 71 C95 96 47 101 0 80 Z"
            fill={studentPalette.backgroundStrong}
          />
        </Svg>
      </View>

      <MyReservationsHeader
        activeCount={activeCount}
        hasError={Boolean(error)}
        loading={loading}
      />

      {renderContent()}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: studentPalette.background,
  },
  backgroundDecor: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  backgroundWave: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
  },
  listContent: {
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  feedbackState: {
    marginTop: spacing.sm,
    borderRadius: 22,
    borderColor: studentPalette.border,
    backgroundColor: studentPalette.card,
    shadowColor: studentPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
});
