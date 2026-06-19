import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { spacing } from "../../constants/spacing";
import { typography } from "../../theme";
import { studentPalette } from "../../theme/studentPalette";
import { Card } from "../Card";
import { StudentStatusPill } from "../StudentStatusPill";
import { StudentVisualPlaceholder } from "../StudentVisualPlaceholder";

export function CreateRestaurantHeader() {
  return (
    <Card style={styles.hero}>
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
          style={styles.wave}
        >
          <Path
            d="M0 34 C78 16 146 52 224 36 C288 22 329 18 360 28 V58 H0 Z"
            fill={studentPalette.primaryPale}
          />
        </Svg>
        <View style={styles.glow} />
      </View>

      <View style={styles.contentRow}>
        <StudentVisualPlaceholder
          iconName="storefront-outline"
          label="Crear restaurante"
          size="md"
          style={styles.visual}
          variant="restaurant"
        />

        <View style={styles.copy}>
          <StudentStatusPill
            iconName="store-plus-outline"
            label="Configuración inicial"
            tone="primary"
          />
          <Text style={styles.title}>Crea tu restaurante</Text>
          <Text style={styles.subtitle}>
            Registra el nombre del restaurante para activar tu panel de
            encargado.
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  hero: {
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
  wave: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
  },
  glow: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 999,
    right: -34,
    top: -28,
    backgroundColor: studentPalette.decorOrangeSoft,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  visual: {
    width: 76,
    height: 84,
    minHeight: 84,
    borderRadius: 20,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  title: {
    fontSize: 24,
    fontWeight: typography.weights.bold,
    color: studentPalette.textPrimary,
    lineHeight: 30,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: studentPalette.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
});
