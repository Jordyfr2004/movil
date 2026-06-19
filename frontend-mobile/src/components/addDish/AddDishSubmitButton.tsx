import React from "react";
import { StyleSheet, View } from "react-native";

import { spacing } from "../../constants/spacing";
import { AppButton } from "../AppButton";

type AddDishSubmitButtonProps = {
  disabled: boolean;
  isEditMode: boolean;
  isSubmitting: boolean;
  onPress: () => void;
};

export function AddDishSubmitButton({
  disabled,
  isEditMode,
  isSubmitting,
  onPress,
}: AddDishSubmitButtonProps) {
  const label = isSubmitting
    ? "Guardando..."
    : isEditMode
      ? "Guardar cambios"
      : "Guardar plato";

  return (
    <View style={styles.actions}>
      <AppButton
        label={label}
        onPress={onPress}
        disabled={disabled}
        accessibilityLabel={label}
        accessibilityHint={
          isEditMode
            ? "Guarda los cambios realizados en el plato."
            : "Guarda el nuevo plato en el restaurante."
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.sm,
  },
});
