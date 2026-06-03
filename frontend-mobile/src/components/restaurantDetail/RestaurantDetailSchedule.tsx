import React from "react";
import { StyleSheet, Text } from "react-native";

import { spacing } from "../../constants/spacing";
import { colors, typography } from "../../theme";
import { Card } from "../Card";

type RestaurantDetailScheduleProps = {
  openingTime?: string;
  closingTime?: string;
};

export function RestaurantDetailSchedule({
  openingTime,
  closingTime,
}: RestaurantDetailScheduleProps) {
  if (!openingTime || !closingTime) {
    return null;
  }

  return (
    <Card variant="muted" style={styles.metaItem}>
      <Text style={styles.metaLabel}>Horario</Text>
      <Text style={styles.metaValue}>
        {openingTime} - {closingTime}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  metaItem: {
    borderRadius: 14,
    padding: spacing.md,
  },
  metaLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  metaValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
  },
});
