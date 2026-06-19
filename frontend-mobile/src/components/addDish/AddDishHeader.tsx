import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { spacing } from "../../constants/spacing";
import { typography } from "../../theme";
import { studentPalette } from "../../theme/studentPalette";
import { Card } from "../Card";
import { StudentStatusPill } from "../StudentStatusPill";
import { StudentVisualPlaceholder } from "../StudentVisualPlaceholder";

type AddDishHeaderProps = {
  isEditMode: boolean;
};

export function AddDishHeader({ isEditMode }: AddDishHeaderProps) {
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
          iconName={isEditMode ? "pencil-outline" : "food-variant"}
          label={isEditMode ? "Editar plato" : "Añadir plato"}
          size="md"
          style={styles.visual}
          variant="dish"
        />

        <View style={styles.copy}>
          <StudentStatusPill
            iconName={isEditMode ? "pencil-outline" : "plus-circle-outline"}
            label={isEditMode ? "Edición" : "Nuevo plato"}
            tone="primary"
          />
          <Text style={styles.title}>
            {isEditMode ? "Editar plato" : "Añadir plato"}
          </Text>
          <Text style={styles.subtitle}>
            {isEditMode
              ? "Actualiza nombre, descripción o precio y mantén tu carta al día."
              : "Agrega un plato a tu carta para que los estudiantes puedan verlo."}
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
