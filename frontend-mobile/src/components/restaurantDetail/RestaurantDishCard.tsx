import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { spacing } from "../../constants/spacing";
import type { Dish } from "../../services/dishService";
import { typography } from "../../theme";
import { studentPalette } from "../../theme/studentPalette";
import { StudentStatusPill } from "../StudentStatusPill";
import { StudentVisualPlaceholder } from "../StudentVisualPlaceholder";
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
    <View style={styles.card}>
      <StudentVisualPlaceholder
        iconName="food-variant"
        label={`Plato ${dish.name}`}
        size="sm"
        style={styles.visual}
        variant="dish"
      />

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.dishName} numberOfLines={2}>
            {dish.name}
          </Text>
          {!dish.isAvailable || !dish.isActive ? (
            <StudentStatusPill label="No disponible" tone="neutral" />
          ) : null}
        </View>

        {dish.description ? (
          <Text style={styles.dishMeta} numberOfLines={2}>
            {dish.description}
          </Text>
        ) : null}

        <View style={styles.bottomRow}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: studentPalette.border,
    backgroundColor: studentPalette.card,
    shadowColor: studentPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 1,
  },
  visual: {
    width: 56,
    height: 56,
    borderRadius: 16,
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  dishName: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: studentPalette.textPrimary,
    lineHeight: typography.lineHeights.md,
  },
  dishMeta: {
    fontSize: typography.sizes.sm,
    color: studentPalette.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
  bottomRow: {
    marginTop: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  dishPrice: {
    flex: 1,
    minWidth: 58,
    fontSize: 18,
    fontWeight: typography.weights.bold,
    color: studentPalette.primary,
    lineHeight: 24,
  },
});
