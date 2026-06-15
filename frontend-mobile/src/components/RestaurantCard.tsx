import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Restaurant } from "../types/models";
import { typography } from "../theme";
import { studentPalette } from "../theme/studentPalette";
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
      accessibilityRole="button"
      accessibilityLabel={`Ver restaurante ${restaurant.name}`}
      onPress={onPress ? () => onPress(restaurant) : undefined}
      disabled={isDisabled}
      style={({ pressed }) => [
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      <Card style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>

          <View style={styles.headerText}>
            <Text style={styles.name} numberOfLines={2}>
              {restaurant.name}
            </Text>
            {restaurant.location ? (
              <View style={styles.locationRow}>
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={15}
                  color={studentPalette.primary}
                />
                <Text style={styles.location} numberOfLines={2}>
                  {restaurant.location}
                </Text>
              </View>
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

        {(restaurant.openingTime && restaurant.closingTime) || !isDisabled ? (
          <View style={styles.footer}>
            {restaurant.openingTime && restaurant.closingTime ? (
              <View style={styles.schedule}>
                <View style={styles.scheduleIcon}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={17}
                    color={studentPalette.primary}
                  />
                </View>
                <View style={styles.scheduleText}>
                  <Text style={styles.timeLabel}>Horario</Text>
                  <Text style={styles.timeValue} numberOfLines={1}>
                    {restaurant.openingTime} - {restaurant.closingTime}
                  </Text>
                </View>
              </View>
            ) : null}

            {!isDisabled ? (
              <View style={styles.cardAction}>
                <Text style={styles.cardActionText}>Ver menú</Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={19}
                  color={studentPalette.card}
                />
              </View>
            ) : null}
          </View>
        ) : null}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderColor: studentPalette.border,
    backgroundColor: studentPalette.card,
    padding: spacing.lg,
    shadowColor: studentPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 2,
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.992 }],
  },
  disabled: {
    opacity: 0.65,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: studentPalette.primaryPale,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: studentPalette.border,
  },
  avatarText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: studentPalette.primary,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: studentPalette.textPrimary,
    lineHeight: typography.lineHeights.md,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  location: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: studentPalette.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
  description: {
    marginTop: spacing.md,
    fontSize: typography.sizes.sm,
    color: studentPalette.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
  footer: {
    marginTop: spacing.md,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: studentPalette.border,
  },
  schedule: {
    flex: 1,
    minWidth: 128,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  scheduleText: {
    flex: 1,
    minWidth: 0,
  },
  scheduleIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: studentPalette.primaryPale,
  },
  timeLabel: {
    fontSize: typography.sizes.xs,
    color: studentPalette.textMuted,
    lineHeight: typography.lineHeights.xs,
  },
  timeValue: {
    fontSize: typography.sizes.sm,
    color: studentPalette.textPrimary,
    fontWeight: typography.weights.semiBold,
    lineHeight: typography.lineHeights.sm,
  },
  cardAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    minHeight: 40,
    marginLeft: "auto",
    paddingHorizontal: spacing.md,
    borderRadius: 14,
    backgroundColor: studentPalette.primary,
    shadowColor: studentPalette.primary,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  cardActionText: {
    fontSize: typography.sizes.sm,
    color: studentPalette.card,
    fontWeight: typography.weights.bold,
  },
});
