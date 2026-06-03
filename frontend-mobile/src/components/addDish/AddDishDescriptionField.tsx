import React from "react";

import { AppInput } from "../AppInput";

type AddDishDescriptionFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
};

export function AddDishDescriptionField({
  value,
  onChangeText,
}: AddDishDescriptionFieldProps) {
  return (
    <AppInput
      label="Descripción (opcional)"
      value={value}
      onChangeText={onChangeText}
      placeholder="Ej: Incluye ensalada y bebida"
      autoCapitalize="sentences"
      multiline
      numberOfLines={3}
      maxLength={500}
      accessibilityLabel="Descripción del plato"
      accessibilityHint="Agrega una descripción opcional del plato."
    />
  );
}
