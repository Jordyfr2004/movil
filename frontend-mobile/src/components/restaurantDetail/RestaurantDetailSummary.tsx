import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { spacing } from "../../constants/spacing";
import { typography } from "../../theme";
import { studentPalette } from "../../theme/studentPalette";
import { Card } from "../Card";

type RestaurantDetailSummaryProps = {
  description?: string;
};

export function RestaurantDetailSummary({
  description,
}: RestaurantDetailSummaryProps) {
  if (!description) {
    return null;
  }

  return (
    <Card style={styles.card}>
      <View style={styles.titleRow}>
        <View style={styles.icon}>
          <MaterialCommunityIcons
            name="text-box-outline"
            size={17}
            color={studentPalette.primary}
          />
        </View>
        <Text style={styles.cardTitle}>Descripción</Text>
      </View>
      <Text style={styles.cardText}>{description}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    borderRadius: 20,
    borderColor: studentPalette.border,
    backgroundColor: studentPalette.card,
    shadowColor: studentPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: studentPalette.primaryPale,
    borderWidth: 1,
    borderColor: studentPalette.border,
  },
  cardTitle: {
    fontSize: typography.sizes.md,
    color: studentPalette.textPrimary,
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.md,
  },
  cardText: {
    fontSize: typography.sizes.sm,
    color: studentPalette.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
});
