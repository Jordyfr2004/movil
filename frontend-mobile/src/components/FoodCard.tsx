import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { spacing } from "../constants/spacing";
import { Dish } from "../services/dishService";
import { designSystem, typography } from "../theme";
import { StatusBadge } from "./StatusBadge";

type FoodCardProps = {
  dish: Dish;
  onPress?: (dish: Dish) => void;
};

export function FoodCard({ dish, onPress }: FoodCardProps) {
  const price = dish.price?.trim();
  const isUnavailable = !dish.isActive || !dish.isAvailable;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={dish.name}
      disabled={!onPress}
      onPress={onPress ? () => onPress(dish) : undefined}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
        !onPress && styles.disabled,
      ]}
    >
      <View style={styles.media}>
        {dish.imageUrl ? (
          <Image source={{ uri: dish.imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <View style={styles.placeholderGlow} />
            <MaterialCommunityIcons
              name="food-variant"
              size={designSystem.iconSizes.xl}
              color={designSystem.colors.primary}
            />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={2}>
            {dish.name}
          </Text>
          {price ? <Text style={styles.price}>${price}</Text> : null}
        </View>

        {dish.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {dish.description}
          </Text>
        ) : null}

        {isUnavailable ? (
          <StatusBadge label="No disponible" tone="neutral" />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 224,
    borderRadius: designSystem.radii.xl,
    backgroundColor: designSystem.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
    overflow: "hidden",
    ...designSystem.shadows.low,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: designSystem.colors.surfacePressed,
  },
  disabled: {
    opacity: 0.94,
  },
  media: {
    height: 112,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: designSystem.colors.primaryFaint,
  },
  placeholder: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  placeholderGlow: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 999,
    backgroundColor: designSystem.colors.primarySoft,
    opacity: 0.46,
    transform: [{ translateX: 48 }, { translateY: -20 }],
  },
  image: {
    width: "100%",
    height: "100%",
  },
  content: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  name: {
    flex: 1,
    color: designSystem.colors.textPrimary,
    fontSize: typography.roles.cardTitle.fontSize,
    lineHeight: typography.roles.cardTitle.lineHeight,
    fontWeight: typography.roles.cardTitle.fontWeight,
  },
  price: {
    color: designSystem.colors.primary,
    fontSize: typography.roles.price.fontSize,
    lineHeight: typography.roles.price.lineHeight,
    fontWeight: typography.roles.price.fontWeight,
  },
  description: {
    color: designSystem.colors.textSecondary,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
  },
});
