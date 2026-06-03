import React from "react";

import { AppInput } from "../AppInput";

type AddDishNameFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
};

export function AddDishNameField({
  value,
  onChangeText,
}: AddDishNameFieldProps) {
  return (
    <AppInput
      label="Nombre"
      value={value}
      onChangeText={onChangeText}
      placeholder="Ej: Arroz con pollo"
      autoCapitalize="words"
      accessibilityLabel="Nombre del plato"
      accessibilityHint="Ingresa el nombre del plato."
    />
  );
}
