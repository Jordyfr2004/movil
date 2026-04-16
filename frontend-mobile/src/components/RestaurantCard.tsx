import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Restaurant } from "../types/models";
import { colors, typography } from "../theme";
import { spacing } from "../constants/spacing";

type RestaurantCardProps = {
  restaurant: Restaurant;
  onPress?: (restaurant: Restaurant) => void;
  disabled?: boolean;
};

export function RestaurantCard({
  restaurant,
  onPress,
  disabled = false,
}: RestaurantCardProps) {
  const isDisabled = disabled || !onPress;

  return (
    <Pressable
      onPress={onPress ? () => onPress(restaurant) : undefined}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.card,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.name}>{restaurant.name}</Text>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: restaurant.isActive ? colors.success : colors.error },
          ]}
        />
      </View>
      <Text style={styles.location}>{restaurant.location}</Text>
      {restaurant.description ? (
        <Text style={styles.description}>{restaurant.description}</Text>
      ) : null}
      <View style={styles.footer}>
        <Text style={styles.timeLabel}>Horario</Text>
        <Text style={styles.timeValue}>
          {restaurant.openingTime} - {restaurant.closingTime}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  name: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  location: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  timeValue: {
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
    fontWeight: typography.weights.semiBold,
  },
});
