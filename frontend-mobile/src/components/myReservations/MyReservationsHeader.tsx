import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { spacing } from "../../constants/spacing";
import { colors, typography } from "../../theme";

type MyReservationsHeaderProps = {
  activeCount: number;
  loading: boolean;
};

export function MyReservationsHeader({
  activeCount,
  loading,
}: MyReservationsHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Mis reservas</Text>
      <Text style={styles.subtitle}>
        {loading
          ? "Cargando tus reservas…"
          : activeCount > 0
            ? `Tienes ${activeCount} reserva${activeCount === 1 ? "" : "s"} activa${activeCount === 1 ? "" : "s"}.`
            : "No tienes reservas activas por ahora."}
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
