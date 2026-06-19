import React from "react";
import { StyleSheet } from "react-native";

import { Card } from "../Card";
import { StudentSectionHeader } from "../StudentSectionHeader";
import { spacing } from "../../constants/spacing";
import {
  MANAGER_DISHES_CARD_MARGIN_TOP,
  getManagerDishesSubtitle,
  managerPalette,
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
      <StudentSectionHeader
        count={isLoadingDishes ? "..." : dishesCount}
        iconName="food-outline"
        title="Carta del restaurante"
        subtitle={getManagerDishesSubtitle(isLoadingDishes, dishesCount)}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: MANAGER_DISHES_CARD_MARGIN_TOP,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: 20,
    borderColor: managerPalette.border,
    backgroundColor: managerPalette.card,
    shadowColor: managerPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 1,
  },
});
