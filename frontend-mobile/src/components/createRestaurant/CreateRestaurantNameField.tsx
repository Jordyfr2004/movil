import React from "react";

import { AppInput } from "../AppInput";

type CreateRestaurantNameFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
};

export function CreateRestaurantNameField({
  value,
  onChangeText,
}: CreateRestaurantNameFieldProps) {
  return (
    <AppInput
      label="Nombre del restaurante"
      value={value}
      onChangeText={onChangeText}
      placeholder="Ej: Comedor Central"
      autoCapitalize="words"
      accessibilityLabel="Nombre del restaurante"
      accessibilityHint="Ingresa el nombre del restaurante."
    />
  );
}
