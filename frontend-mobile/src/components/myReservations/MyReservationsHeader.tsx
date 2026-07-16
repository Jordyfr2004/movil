import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { spacing } from "../../constants/spacing";
import { typography } from "../../theme";
import { studentPalette } from "../../theme/studentPalette";
import { Card } from "../Card";
import { StudentStatusPill } from "../StudentStatusPill";

type MyReservationsHeaderProps = {
  activeCount: number;
  hasError: boolean;
  loading: boolean;
};

export function MyReservationsHeader({
  activeCount,
  hasError,
  loading,
}: MyReservationsHeaderProps) {
  return (
    <Card style={styles.header}>
      <View style={styles.headingRow}>
        <View style={styles.titleGroup}>
          <View style={styles.icon}>
            <MaterialCommunityIcons
              name="calendar-check-outline"
              size={20}
              color={studentPalette.primary}
            />
          </View>
          <Text style={styles.title}>Mis reservas</Text>
        </View>

        {!loading && !hasError ? (
          <StudentStatusPill
            label={`${activeCount} activa${activeCount === 1 ? "" : "s"}`}
            tone={activeCount > 0 ? "warning" : "neutral"}
          />
        ) : null}
      </View>

      <Text style={styles.subtitle}>
        {loading || hasError
          ? "Estamos actualizando tu historial."
          : "Reservas activas e historial en un solo lugar."}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    position: "relative",
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: 18,
    borderColor: studentPalette.border,
    backgroundColor: studentPalette.card,
    shadowColor: studentPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
    overflow: "hidden",
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  titleGroup: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: studentPalette.card,
    borderWidth: 1,
    borderColor: studentPalette.border,
  },
  title: {
    flex: 1,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: studentPalette.textPrimary,
    lineHeight: typography.lineHeights.xl,
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: typography.sizes.xs,
    color: studentPalette.textSecondary,
    lineHeight: typography.lineHeights.xs,
  },
});
