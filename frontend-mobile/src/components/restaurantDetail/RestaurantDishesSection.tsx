import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { spacing } from "../../constants/spacing";
import type { Dish } from "../../services/dishService";
import { typography } from "../../theme";
import { studentPalette } from "../../theme/studentPalette";
import { Card } from "../Card";
import { RestaurantDishCard } from "./RestaurantDishCard";
import { RestaurantDishesFeedback } from "./RestaurantDishesFeedback";

type RestaurantDishesSectionProps = {
  dishes: Dish[];
  error: string | null;
  isCheckingReservation: boolean;
  isReservingDishId: string | null;
  loading: boolean;
  onReload: () => void;
  onReserve: (dishId: string) => void;
  reservedDishIdSet: Set<string>;
};

export function RestaurantDishesSection({
  dishes,
  error,
  isCheckingReservation,
  isReservingDishId,
  loading,
  onReload,
  onReserve,
  reservedDishIdSet,
}: RestaurantDishesSectionProps) {
  return (
    <Card style={styles.menuCard}>
      <View style={styles.menuHeader}>
        <View style={styles.menuIcon}>
          <MaterialCommunityIcons
            name="food-outline"
            size={20}
            color={studentPalette.card}
          />
        </View>
        <View style={styles.menuHeaderText}>
          <Text style={styles.menuTitle}>Menú del día</Text>
          <Text style={styles.menuSubtitle}>
            Platos disponibles para reservar.
          </Text>
        </View>
      </View>

      {loading ? (
        <RestaurantDishesFeedback variant="loading" style={styles.feedbackState} />
      ) : error ? (
        <RestaurantDishesFeedback
          variant="error"
          error={error}
          onRetry={onReload}
          style={styles.feedbackState}
        />
      ) : dishes.length > 0 ? (
        <View style={styles.menuList}>
          {dishes.map((dish) => {
            const dishId = String(dish.id);

            return (
              <RestaurantDishCard
                key={dishId}
                dish={dish}
                isCheckingReservation={isCheckingReservation}
                isReserved={reservedDishIdSet.has(dishId)}
                isReserving={isReservingDishId === dishId}
                isReservationBusy={Boolean(isReservingDishId)}
                onReserve={onReserve}
              />
            );
          })}
        </View>
      ) : (
        <RestaurantDishesFeedback variant="empty" style={styles.feedbackState} />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  menuCard: {
    marginTop: spacing.md,
    padding: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    shadowOpacity: 0,
    elevation: 0,
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: studentPalette.primary,
    shadowColor: studentPalette.primary,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  menuHeaderText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: studentPalette.textPrimary,
    lineHeight: typography.lineHeights.lg,
  },
  menuSubtitle: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.sm,
    color: studentPalette.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
  menuList: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
  feedbackState: {
    marginTop: spacing.md,
  },
});
