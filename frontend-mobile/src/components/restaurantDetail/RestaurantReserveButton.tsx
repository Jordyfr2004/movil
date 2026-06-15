import React from "react";
import { StyleSheet } from "react-native";

import { studentPalette } from "../../theme/studentPalette";
import { AppButton } from "../AppButton";

type RestaurantReserveButtonProps = {
  dishName: string;
  disabled: boolean;
  isReserved: boolean;
  isReserving: boolean;
  onPress: () => void;
};

export function RestaurantReserveButton({
  dishName,
  disabled,
  isReserved,
  isReserving,
  onPress,
}: RestaurantReserveButtonProps) {
  const label = isReserving
    ? "Reservando…"
    : isReserved
      ? "Ya reservaste"
      : "Reservar";

  const accessibilityLabel = isReserving
    ? `Reservando ${dishName}`
    : isReserved
      ? `Reserva registrada para ${dishName}`
      : `Reservar ${dishName}`;

  const accessibilityHint = isReserved
    ? "Este plato ya tiene una reserva activa."
    : "Crea una reserva para este plato.";

  return (
    <AppButton
      label={label}
      variant={isReserved ? "secondary" : "primary"}
      size="sm"
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, isReserved && styles.reservedButton]}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 108,
    minHeight: 40,
    borderRadius: 14,
    backgroundColor: studentPalette.primary,
    shadowColor: studentPalette.primary,
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  reservedButton: {
    backgroundColor: studentPalette.primaryPale,
    borderColor: studentPalette.border,
    shadowOpacity: 0,
    elevation: 0,
  },
});
