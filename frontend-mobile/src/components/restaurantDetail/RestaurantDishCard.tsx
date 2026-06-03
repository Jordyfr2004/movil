import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { spacing } from "../../constants/spacing";
import type { Dish } from "../../services/dishService";
import { colors, typography } from "../../theme";
import { RestaurantReserveButton } from "./RestaurantReserveButton";

type RestaurantDishCardProps = {
  dish: Dish;
  isCheckingReservation: boolean;
  isReserved: boolean;
  isReserving: boolean;
  isReservationBusy: boolean;
  onReserve: (dishId: string) => void;
};

export function RestaurantDishCard({
  dish,
  isCheckingReservation,
  isReserved,
  isReserving,
  isReservationBusy,
  onReserve,
}: RestaurantDishCardProps) {
  const dishId = String(dish.id);

  return (
    <View style={styles.dishRow}>
      <View style={styles.dishText}>
        <Text style={styles.dishName} numberOfLines={1}>
          {dish.name}
        </Text>
        {dish.description ? (
          <Text style={styles.dishMeta} numberOfLines={2}>
            {dish.description}
          </Text>
        ) : null}
      </View>

      <View style={styles.dishActions}>
        <Text style={styles.dishPrice} numberOfLines={1}>
          ${dish.price}
        </Text>

        <RestaurantReserveButton
          dishName={dish.name}
          disabled={isReservationBusy || isReserved || isCheckingReservation}
          isReserved={isReserved}
          isReserving={isReserving}
          onPress={() => onReserve(dishId)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dishRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dishText: {
    flex: 1,
    gap: 2,
  },
  dishName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeights.md,
  },
  dishMeta: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    lineHeight: typography.lineHeights.sm,
  },
  dishActions: {
    alignItems: "flex-end",
    justifyContent: "center",
    gap: spacing.xs,
  },
  dishPrice: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
});
