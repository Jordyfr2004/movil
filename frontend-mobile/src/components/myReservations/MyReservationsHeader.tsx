import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";

import {
  DecorCupIcon,
  DecorLeafIcon,
} from "../login/LoginDecorIcons";
import { spacing } from "../../constants/spacing";
import { typography } from "../../theme";
import { studentPalette } from "../../theme/studentPalette";

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
    <View style={styles.header}>
      <View
        style={styles.decor}
        pointerEvents="none"
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Svg
          width="100%"
          height={82}
          viewBox="0 0 360 82"
          preserveAspectRatio="none"
          style={styles.decorWave}
        >
          <Path
            d="M0 47 C72 22 139 72 217 53 C284 36 326 23 360 37 V82 H0 Z"
            fill={studentPalette.primaryPale}
          />
        </Svg>
        <View style={styles.decorCup}>
          <DecorCupIcon color={studentPalette.decorOrange} size={42} />
        </View>
        <View style={styles.decorLeaf}>
          <DecorLeafIcon color={studentPalette.decorOrangeSoft} size={42} />
        </View>
      </View>

      <View style={styles.headingRow}>
        <View style={styles.icon}>
          <MaterialCommunityIcons
            name="calendar-check-outline"
            size={22}
            color={studentPalette.primary}
          />
        </View>
        <Text style={styles.eyebrow}>TU ACTIVIDAD</Text>
      </View>

      <Text style={styles.title}>Mis reservas</Text>
      {!loading && !hasError ? (
        <Text style={styles.subtitle}>
          {activeCount > 0
            ? `Tienes ${activeCount} reserva${activeCount === 1 ? "" : "s"} activa${activeCount === 1 ? "" : "s"}.`
            : "No tienes reservas activas por ahora."}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: "relative",
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: studentPalette.border,
    backgroundColor: studentPalette.card,
    shadowColor: studentPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
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
  decorCup: {
    position: "absolute",
    top: 8,
    right: 12,
    transform: [{ rotate: "8deg" }],
  },
  decorLeaf: {
    position: "absolute",
    right: 58,
    bottom: -2,
    transform: [{ rotate: "-12deg" }],
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: studentPalette.card,
    borderWidth: 1,
    borderColor: studentPalette.border,
  },
  eyebrow: {
    fontSize: typography.sizes.xs,
    color: studentPalette.primary,
    fontWeight: typography.weights.bold,
    letterSpacing: 1.2,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: studentPalette.textPrimary,
    lineHeight: typography.lineHeights.xl,
    letterSpacing: -0.3,
  },
  subtitle: {
    maxWidth: "88%",
    marginTop: spacing.sm,
    fontSize: typography.sizes.sm,
    color: studentPalette.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
});
