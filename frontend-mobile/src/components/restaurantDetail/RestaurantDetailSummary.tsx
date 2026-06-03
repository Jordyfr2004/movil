import React from "react";
import { StyleSheet, Text } from "react-native";

import { spacing } from "../../constants/spacing";
import { colors, typography } from "../../theme";
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
    <Card>
      <Text style={styles.cardTitle}>Descripción</Text>
      <Text style={styles.cardText}>{description}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  cardTitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.semiBold,
    marginBottom: spacing.sm,
  },
  cardText: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    lineHeight: typography.lineHeights.md,
  },
});
