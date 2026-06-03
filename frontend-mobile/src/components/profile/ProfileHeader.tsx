import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { spacing } from "../../constants/spacing";
import { colors, typography } from "../../theme";

export function ProfileHeader() {
  return (
    <View style={styles.header}>
      <Text style={styles.title} accessibilityRole="header">
        Mi perfil
      </Text>
      <Text style={styles.subtitle}>
        Información de tu cuenta y acceso rápido a tu sesión.
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
