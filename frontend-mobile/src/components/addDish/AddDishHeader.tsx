import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { spacing } from "../../constants/spacing";
import { colors, typography } from "../../theme";

type AddDishHeaderProps = {
  isEditMode: boolean;
};

export function AddDishHeader({ isEditMode }: AddDishHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>
        {isEditMode ? "Editar plato" : "Añadir plato"}
      </Text>
      <Text style={styles.subtitle}>
        {isEditMode
          ? "Actualiza la información del plato."
          : "Agrega un plato para que los estudiantes lo vean en tu restaurante."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeights.xl,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.md,
  },
});
