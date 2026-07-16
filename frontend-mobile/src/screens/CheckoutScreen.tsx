import React, { useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useStripe } from "@stripe/stripe-react-native";

import { AppButton, EmptyState, Screen } from "../components";
import { spacing } from "../constants/spacing";
import { STRIPE_PUBLISHABLE_KEY } from "../constants/stripe";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { ROUTES } from "../navigation/routes";
import { StudentStackParamList } from "../navigation/types";
import { createPaymentIntent } from "../services/paymentService";
import {
  createReservation,
  getMyReservationById,
} from "../services/reservationService";
import { isSessionExpiryInProgress } from "../services/sessionExpiryService";
import { designSystem, typography } from "../theme";
import { studentPalette } from "../theme/studentPalette";
import { Reservation } from "../types/models";

type Props = NativeStackScreenProps<StudentStackParamList, typeof ROUTES.Checkout>;

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`;
}

function logCheckoutDebug(message: string, details: Record<string, unknown>) {
  if (__DEV__) {
    console.log(`[checkout] ${message}`, details);
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function friendlyError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (message.includes("network") || message.includes("conectar")) {
    return "No pudimos conectar con el servidor. Revisa tu conexión.";
  }

  if (message.includes("401") || message.includes("403") || message.includes("sesión")) {
    return "Tu sesión expiró. Vuelve a iniciar sesión.";
  }

  if (message.includes("dispon")) {
    return "Uno o más platos ya no están disponibles.";
  }

  return "No se pudo completar el checkout. Tu carrito se conserva.";
}

function isSessionError(error: unknown) {
  const status =
    typeof error === "object" &&
    error !== null &&
    typeof (error as { status?: unknown }).status === "number"
      ? (error as { status: number }).status
      : undefined;
  const statusCode =
    typeof error === "object" &&
    error !== null &&
    typeof (error as { statusCode?: unknown }).statusCode === "number"
      ? (error as { statusCode: number }).statusCode
      : undefined;
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  return (
    status === 401 ||
    statusCode === 401 ||
    message.includes("401") ||
    message.includes("token") ||
    message.includes("sesión") ||
    message.includes("sesion")
  );
}

export function CheckoutScreen({ navigation }: Props) {
  const { accessToken } = useAuth();
  const { clearCart, items, restaurant, subtotal, total } = useCart();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [submitting, setSubmitting] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(
    null
  );

  const waitForReservationAfterPayment = async (
    reservationId: string
  ): Promise<Reservation | null> => {
    if (!accessToken) return null;

    for (let attempt = 0; attempt <= 3; attempt += 1) {
      if (attempt > 0) {
        await delay(900);
      }

      const nextReservation = await getMyReservationById(
        accessToken,
        reservationId
      );

      logCheckoutDebug("Estado recibido después del pago", {
        attempt,
        reservationId,
        status: nextReservation?.status ?? "not_found",
      });

      if (!nextReservation) {
        continue;
      }

      if (nextReservation.status !== "pending_payment" || attempt === 3) {
        return nextReservation;
      }
    }

    return null;
  };

  const handleCheckout = async () => {
    if (submitting) return;

    if (!accessToken) {
      Alert.alert("Sesión requerida", "Inicia sesión para continuar.");
      return;
    }

    if (!STRIPE_PUBLISHABLE_KEY) {
      Alert.alert(
        "Falta configurar Stripe",
        "No se encontró la llave pública de Stripe."
      );
      return;
    }

    try {
      setSubmitting(true);
      setConfirmationMessage(null);

      const reservation = await createReservation(accessToken, {
        items: items.map((item) => ({
          dish_id: item.dishId,
          quantity: item.quantity,
        })),
      });

      logCheckoutDebug("Reserva creada", {
        reservationId: reservation.id,
        status: reservation.status,
      });

      const intent = await createPaymentIntent(accessToken, reservation.id);

      logCheckoutDebug("PaymentIntent creado", {
        paymentIntentId: intent.payment_intent_id,
        reservationId: reservation.id,
      });

      if (!intent.clientSecret) {
        throw new Error("No se recibió clientSecret del servidor");
      }

      const init = await initPaymentSheet({
        merchantDisplayName: "Comedor ULEAM",
        paymentIntentClientSecret: intent.clientSecret,
      });

      if (init.error) {
        throw new Error(init.error.message);
      }

      const presented = await presentPaymentSheet();

      logCheckoutDebug("Resultado de PaymentSheet", {
        hasError: Boolean(presented.error),
        paymentIntentId: intent.payment_intent_id,
        reservationId: reservation.id,
      });

      if (presented.error) {
        throw new Error(presented.error.message);
      }

      setConfirmationMessage("Confirmando pago...");
      const confirmedReservation = await waitForReservationAfterPayment(
        reservation.id
      );
      const nextReservation = confirmedReservation ?? reservation;

      if (nextReservation.status === "pending_payment") {
        Alert.alert(
          "Pago en confirmación",
          "Stripe completó el pago, pero el servidor aún no confirmó la reserva. Puedes actualizar el estado desde el seguimiento."
        );
      }

      clearCart();
      navigation.replace(ROUTES.ReservationTracking, {
        reservation: nextReservation,
      });
    } catch (error: unknown) {
      if (isSessionError(error) || isSessionExpiryInProgress()) {
        return;
      }

      Alert.alert("Checkout incompleto", friendlyError(error));
    } finally {
      setSubmitting(false);
      setConfirmationMessage(null);
    }
  };

  if (!restaurant || items.length === 0) {
    return (
      <Screen style={styles.container}>
        <EmptyState
          title="Tu carrito está vacío"
          message="Agrega platos antes de continuar."
          iconName="cart-outline"
          actionLabel="Volver"
          onActionPress={() => navigation.goBack()}
        />
      </Screen>
    );
  }

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Resumen final</Text>
        <Text style={styles.subtitle}>{restaurant.name}</Text>
      </View>

      <FlatList
        style={styles.list}
        data={items}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View style={styles.itemRow}>
              <View style={styles.itemText}>
                <Text style={styles.itemName}>{item.name}</Text>
                {!!item.notes && (
                  <Text style={styles.itemNotes} numberOfLines={2}>
                    {item.notes}
                  </Text>
                )}
              </View>
              <Text style={styles.itemPrice}>
                {item.quantity} x {formatMoney(item.price)}
              </Text>
            </View>
          </View>
        )}
      />

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>{formatMoney(subtotal)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatMoney(total)}</Text>
        </View>
        <AppButton
          label={
            confirmationMessage ??
            (submitting ? "Procesando..." : "Crear reserva y pagar")
          }
          onPress={handleCheckout}
          disabled={submitting}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: studentPalette.background,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.xl,
    lineHeight: typography.lineHeights.xl,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    color: designSystem.colors.textSecondary,
    fontSize: typography.sizes.sm,
  },
  list: {
    flex: 1,
    backgroundColor: "transparent",
  },
  listContent: {
    gap: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  itemCard: {
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: designSystem.colors.surface,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
    ...designSystem.shadows.sm,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  itemText: {
    flex: 1,
  },
  itemName: {
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  itemNotes: {
    marginTop: spacing.xs,
    color: designSystem.colors.textMuted,
    fontSize: typography.sizes.xs,
  },
  itemPrice: {
    color: designSystem.colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  summary: {
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryLabel: {
    color: designSystem.colors.textSecondary,
    fontSize: typography.sizes.sm,
  },
  summaryValue: {
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  totalLabel: {
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  totalValue: {
    color: designSystem.colors.primary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
});
