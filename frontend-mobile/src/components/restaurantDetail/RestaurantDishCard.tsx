import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { spacing } from "../../constants/spacing";
import { useReduceMotion } from "../../hooks/useReduceMotion";
import type { Dish } from "../../services/dishService";
import { designSystem, typography } from "../../theme";
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
  index?: number;
  onReserve: (dishId: string) => void;
};

export function RestaurantDishCard({
  dish,
  isCheckingReservation,
  isReserved,
  isReserving,
  isReservationBusy,
  index = 0,
  onReserve,
}: RestaurantDishCardProps) {
  const dishId = String(dish.id);
  const hasImage = Boolean(dish.imageUrl);
  const isDisabled = isReservationBusy || isReserved || isCheckingReservation;
  const reduceMotion = useReduceMotion();
  const opacity = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(reduceMotion ? 0 : 10)).current;

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: designSystem.animation.normal,
        delay: Math.min(index * 45, 180),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: designSystem.animation.normal,
        delay: Math.min(index * 45, 180),
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, opacity, reduceMotion, translateY]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Reservar ${dish.name}`}
        disabled={isDisabled}
        onPress={() => onReserve(dishId)}
        style={({ pressed }) => [
          styles.card,
          isReserved && styles.cardReserved,
          pressed && !isDisabled && styles.cardPressed,
        ]}
      >
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
              disabled={isDisabled}
              isReserved={isReserved}
              isReserving={isReserving}
              onPress={() => onReserve(dishId)}
            />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: studentPalette.border,
    backgroundColor: studentPalette.card,
    shadowColor: studentPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
    backgroundColor: studentPalette.primaryFaint,
  },
  cardReserved: {
    opacity: 0.75,
    backgroundColor: "#F3F3F3",
  },
  image: {
    width: 86,
    height: 78,
    borderRadius: 14,
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
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: studentPalette.primary,
    lineHeight: typography.lineHeights.lg,
  },
});
