import React from "react";
import { StyleSheet, View } from "react-native";

import { spacing } from "../../constants/spacing";
import { AppButton } from "../AppButton";

type MyReservationActionsProps = {
  isCancelling: boolean;
  isPaying: boolean;
  isPaymentInProgress: boolean;
  reservationTitle: string;
  onCancel: () => void;
  onPay: () => void;
};

export function MyReservationActions({
  isCancelling,
  isPaying,
  isPaymentInProgress,
  reservationTitle,
  onCancel,
  onPay,
}: MyReservationActionsProps) {
  return (
    <View style={styles.cardFooter}>
      <AppButton
        label={isPaying ? "Procesando…" : "Pagar"}
        onPress={onPay}
        variant="primary"
        size="sm"
        disabled={isPaymentInProgress || isCancelling}
        accessibilityLabel={
          isPaying
            ? `Procesando pago de ${reservationTitle}`
            : `Pagar reserva de ${reservationTitle}`
        }
        accessibilityHint="Abre el flujo de pago para completar la reserva."
      />
      <AppButton
        label={isCancelling ? "Cancelando…" : "Cancelar"}
        onPress={onCancel}
        variant="danger"
        size="sm"
        disabled={isCancelling || isPaying}
        accessibilityLabel={
          isCancelling
            ? `Cancelando reserva de ${reservationTitle}`
            : `Cancelar reserva de ${reservationTitle}`
        }
        accessibilityHint="Muestra una confirmación antes de cancelar la reserva."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cardFooter: {
    marginTop: spacing.lg,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
  },
});
