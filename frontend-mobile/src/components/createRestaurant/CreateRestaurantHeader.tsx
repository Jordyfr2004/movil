import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { spacing } from "../../constants/spacing";
import { colors, typography } from "../../theme";

export function CreateRestaurantHeader() {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Crea tu restaurante</Text>
      <Text style={styles.subtitle}>
        Como manager, necesitas registrar tu restaurante una sola vez para que
        sea visible a los estudiantes.
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
