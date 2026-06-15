import React from "react";
import { StyleSheet, View } from "react-native";

import { spacing } from "../../constants/spacing";
import { studentPalette } from "../../theme/studentPalette";
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
        style={styles.payButton}
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
        style={styles.cancelButton}
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
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  payButton: {
    flex: 1,
    minWidth: 112,
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: studentPalette.primary,
    shadowColor: studentPalette.primary,
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  cancelButton: {
    flex: 1,
    minWidth: 112,
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: studentPalette.card,
    borderColor: studentPalette.danger,
  },
});
