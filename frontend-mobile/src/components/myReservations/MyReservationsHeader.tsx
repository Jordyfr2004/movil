import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";

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
      <View
        style={styles.decor}
        pointerEvents="none"
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Svg
          width="100%"
          height={58}
          viewBox="0 0 360 58"
          preserveAspectRatio="none"
          style={styles.decorWave}
        >
          <Path
            d="M0 34 C72 16 139 52 217 36 C284 22 326 18 360 28 V58 H0 Z"
            fill={studentPalette.primaryPale}
          />
        </Svg>
        <View style={styles.decorCircle} />
      </View>

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
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: 22,
    borderColor: studentPalette.border,
    backgroundColor: studentPalette.cardMuted,
    shadowColor: studentPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
    overflow: "hidden",
  },
  decor: {
    ...StyleSheet.absoluteFillObject,
  },
  decorWave: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
  },
  decorCircle: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 999,
    right: -34,
    top: -28,
    backgroundColor: "rgba(247, 101, 2, 0.07)",
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
    width: 36,
    height: 36,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: studentPalette.card,
    borderWidth: 1,
    borderColor: studentPalette.border,
  },
  title: {
    flex: 1,
    fontSize: 26,
    fontWeight: typography.weights.bold,
    color: studentPalette.textPrimary,
    lineHeight: 32,
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: typography.sizes.sm,
    color: studentPalette.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
});
