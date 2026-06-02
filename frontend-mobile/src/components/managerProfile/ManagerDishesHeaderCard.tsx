import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card } from "../Card";
import { spacing } from "../../constants/spacing";
import { colors, typography } from "../../theme";
import {
  MANAGER_DISHES_CARD_MARGIN_TOP,
  getManagerDishesSubtitle,
} from "./managerProfileTheme";

type ManagerDishesHeaderCardProps = {
  isLoadingDishes: boolean;
  dishesCount: number;
};

export function ManagerDishesHeaderCard({
  isLoadingDishes,
  dishesCount,
}: ManagerDishesHeaderCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis platos</Text>
        <Text style={styles.subtitle}>
          {getManagerDishesSubtitle(isLoadingDishes, dishesCount)}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: MANAGER_DISHES_CARD_MARGIN_TOP,
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
});
