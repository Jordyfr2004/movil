import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { spacing } from "../../constants/spacing";
import type { Dish } from "../../services/dishService";
import { colors, typography } from "../../theme";
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
      <Text style={styles.menuTitle}>Menú del día</Text>
      <Text style={styles.menuSubtitle}>
        Platos disponibles para reservar.
      </Text>

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
    marginTop: spacing.lg,
  },
  menuTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  menuSubtitle: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
  menuList: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  feedbackState: {
    marginTop: spacing.lg,
  },
});
