import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Restaurant } from "../types/models";
import { colors, typography } from "../theme";
import { spacing } from "../constants/spacing";
import { Card } from "./Card";
import { StatusBadge } from "./StatusBadge";

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
  const initial = restaurant.name?.trim()?.charAt(0)?.toUpperCase() ?? "R";

  return (
    <Pressable
      onPress={onPress ? () => onPress(restaurant) : undefined}
      disabled={isDisabled}
      style={({ pressed }) => [
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      <Card>
        <View style={styles.topRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>

          <View style={styles.headerText}>
            <Text style={styles.name} numberOfLines={1}>
              {restaurant.name}
            </Text>
            {restaurant.location ? (
              <Text style={styles.location} numberOfLines={1}>
                {restaurant.location}
              </Text>
            ) : null}
          </View>

          <StatusBadge
            label={restaurant.isActive ? "Abierto" : "Cerrado"}
            tone={restaurant.isActive ? "success" : "danger"}
          />
        </View>

        {restaurant.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {restaurant.description}
          </Text>
        ) : null}

        {restaurant.openingTime && restaurant.closingTime ? (
          <View style={styles.footer}>
            <Text style={styles.timeLabel}>Horario</Text>
            <Text style={styles.timeValue}>
              {restaurant.openingTime} - {restaurant.closingTime}
            </Text>
          </View>
        ) : null}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.96,
    transform: [{ scale: 0.995 }],
  },
  disabled: {
    opacity: 0.65,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  location: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  description: {
    marginTop: spacing.md,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    lineHeight: typography.lineHeights.sm,
  },
  footer: {
    marginTop: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
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
