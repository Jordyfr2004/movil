import React from "react";
import { StyleSheet, View } from "react-native";

import { spacing } from "../../constants/spacing";
import { AppButton } from "../AppButton";

type CreateRestaurantSubmitButtonProps = {
  disabled: boolean;
  isSubmitting: boolean;
  onPress: () => void;
};

export function CreateRestaurantSubmitButton({
  disabled,
  isSubmitting,
  onPress,
}: CreateRestaurantSubmitButtonProps) {
  const label = isSubmitting ? "Creando…" : "Crear restaurante";

  return (
    <View style={styles.actions}>
      <AppButton
        label={label}
        onPress={onPress}
        disabled={disabled}
        accessibilityLabel={label}
        accessibilityHint="Guarda el restaurante y continúa al perfil del manager."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.sm,
  },
});
