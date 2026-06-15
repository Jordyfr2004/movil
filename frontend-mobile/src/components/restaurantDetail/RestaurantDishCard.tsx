import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { spacing } from "../../constants/spacing";
import type { Dish } from "../../services/dishService";
import { typography } from "../../theme";
import { studentPalette } from "../../theme/studentPalette";
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
      <View style={styles.dishHeader}>
        <View style={styles.dishIcon}>
          <MaterialCommunityIcons
            name="silverware"
            size={20}
            color={studentPalette.primary}
          />
        </View>

        <View style={styles.dishText}>
          <Text style={styles.dishName} numberOfLines={2}>
            {dish.name}
          </Text>
          {dish.description ? (
            <Text style={styles.dishMeta} numberOfLines={2}>
              {dish.description}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.dishActions}>
        <View style={styles.priceGroup}>
          <Text style={styles.priceLabel}>Precio</Text>
          <Text style={styles.dishPrice} numberOfLines={1}>
            ${dish.price}
          </Text>
        </View>

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
    gap: spacing.md,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: studentPalette.border,
    backgroundColor: studentPalette.card,
    shadowColor: studentPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  dishHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  dishIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: studentPalette.primaryPale,
    borderWidth: 1,
    borderColor: studentPalette.border,
  },
  dishText: {
    flex: 1,
    gap: 2,
  },
  dishName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semiBold,
    color: studentPalette.textPrimary,
    lineHeight: typography.lineHeights.md,
  },
  dishMeta: {
    fontSize: typography.sizes.sm,
    color: studentPalette.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
  dishActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: studentPalette.border,
  },
  priceGroup: {
    flex: 1,
    minWidth: 76,
  },
  priceLabel: {
    fontSize: typography.sizes.xs,
    color: studentPalette.textMuted,
    lineHeight: typography.lineHeights.xs,
  },
  dishPrice: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: studentPalette.primary,
  },
});
