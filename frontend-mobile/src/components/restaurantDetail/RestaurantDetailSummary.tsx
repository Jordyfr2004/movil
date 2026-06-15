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
            size={18}
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
    borderRadius: 18,
    borderColor: studentPalette.border,
    backgroundColor: studentPalette.card,
    shadowColor: studentPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: studentPalette.primaryPale,
  },
  cardTitle: {
    fontSize: typography.sizes.md,
    color: studentPalette.textPrimary,
    fontWeight: typography.weights.bold,
  },
  cardText: {
    fontSize: typography.sizes.md,
    color: studentPalette.textSecondary,
    lineHeight: typography.lineHeights.md,
  },
});
