import React from "react";

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
      variant="secondary"
      size="sm"
      disabled={disabled}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    />
  );
}
