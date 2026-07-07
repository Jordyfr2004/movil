import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

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
  const hasImage = Boolean(dish.imageUrl);

  return (
    <View style={[styles.card, isReserved && styles.cardReserved]}>
      {hasImage ? (
        <Image
          source={{ uri: dish.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <StudentVisualPlaceholder
          iconName="food-variant"
          label={`Plato ${dish.name}`}
          size="sm"
          style={styles.image}
          variant="dish"
        />
      )}

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
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: studentPalette.border,
    backgroundColor: studentPalette.card,
    shadowColor: studentPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  cardReserved: {
    opacity: 0.75,
    backgroundColor: "#F3F3F3",
  },
  image: {
    width: 112,
    height: 96,
    borderRadius: 16,
    backgroundColor: studentPalette.primaryFaint,
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 4,
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
    fontSize: 20,
    fontWeight: typography.weights.bold,
    color: studentPalette.primary,
    lineHeight: 26,
  },
});
