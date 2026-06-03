import React from "react";

import { AppInput } from "../AppInput";

type AddDishPriceFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
};

export function AddDishPriceField({
  value,
  onChangeText,
}: AddDishPriceFieldProps) {
  return (
    <AppInput
      label="Precio"
      value={value}
      onChangeText={onChangeText}
      placeholder="Ej: 2.50"
      keyboardType="numeric"
      autoCapitalize="none"
      accessibilityLabel="Precio del plato"
      accessibilityHint="Ingresa el precio del plato usando números."
    />
  );
}
