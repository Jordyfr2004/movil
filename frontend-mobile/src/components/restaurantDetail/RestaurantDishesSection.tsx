import React from "react";
import { StyleSheet, View } from "react-native";

import { spacing } from "../../constants/spacing";
import type { Dish } from "../../services/dishService";
import { StudentSectionHeader } from "../StudentSectionHeader";
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
    <View style={styles.section}>
      <StudentSectionHeader
        count={loading ? "..." : dishes.length}
        iconName="food-outline"
        subtitle="Elige un plato disponible"
        title="Menú del día"
      />

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
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.sm,
  },
  menuList: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  feedbackState: {
    marginTop: spacing.md,
  },
});
