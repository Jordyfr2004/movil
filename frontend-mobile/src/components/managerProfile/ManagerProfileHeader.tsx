import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";

import { spacing } from "../../constants/spacing";
import { typography } from "../../theme";
import { Card } from "../Card";
import { managerPalette } from "./managerProfileTheme";

export function ManagerProfileHeader() {
  return (
    <Card style={styles.headerCard}>
      <View
        style={styles.decor}
        pointerEvents="none"
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Svg
          width="100%"
          height={60}
          viewBox="0 0 360 60"
          preserveAspectRatio="none"
          style={styles.wave}
        >
          <Path
            d="M0 36 C74 16 142 54 218 38 C286 24 326 18 360 28 V60 H0 Z"
            fill={managerPalette.primaryPale}
          />
        </Svg>
        <View style={styles.glow} />
      </View>

      <View style={styles.eyebrowRow}>
        <View style={styles.iconShell}>
          <MaterialCommunityIcons
            name="store-cog-outline"
            size={18}
            color={managerPalette.primary}
          />
        </View>
        <Text style={styles.eyebrow}>Administración</Text>
      </View>

      <Text style={styles.title}>Panel de encargado</Text>
      <Text style={styles.subtitle}>
        Gestiona tu restaurante, mantén la carta ordenada y controla qué platos
        ven los estudiantes.
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: 22,
    borderColor: managerPalette.border,
    backgroundColor: managerPalette.cardMuted,
    shadowColor: managerPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
    overflow: "hidden",
  },
  decor: {
    ...StyleSheet.absoluteFillObject,
  },
  wave: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
  },
  glow: {
    position: "absolute",
    width: 104,
    height: 104,
    borderRadius: 999,
    right: -38,
    top: -32,
    backgroundColor: managerPalette.decorOrangeSoft,
  },
  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  iconShell: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: managerPalette.primaryPale,
    borderWidth: 1,
    borderColor: managerPalette.border,
  },
  eyebrow: {
    fontSize: typography.sizes.xs,
    color: managerPalette.primary,
    fontWeight: typography.weights.bold,
    letterSpacing: 0,
  },
  title: {
    maxWidth: 280,
    fontSize: 24,
    fontWeight: typography.weights.bold,
    color: managerPalette.textPrimary,
    lineHeight: 30,
  },
  subtitle: {
    maxWidth: 310,
    marginTop: spacing.xs,
    fontSize: typography.sizes.sm,
    color: managerPalette.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
});
