import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { spacing } from "../constants/spacing";
import { typography } from "../theme";
import { studentPalette } from "../theme/studentPalette";
import { Restaurant } from "../types/models";
import { Card } from "./Card";
import { StudentStatusPill } from "./StudentStatusPill";
import { StudentVisualPlaceholder } from "./StudentVisualPlaceholder";

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
        styles.touchable,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      <Card style={styles.card}>
        <StudentVisualPlaceholder
          initial={initial}
          label={`Restaurante ${restaurant.name}`}
          size="md"
          style={styles.visual}
          variant="restaurant"
        />

        <View style={styles.content}>
          <View style={styles.headerText}>
            <Text style={styles.name} numberOfLines={2}>
              {restaurant.name}
            </Text>

            {restaurant.location ? (
              <View style={styles.locationRow}>
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={15}
                  color={studentPalette.textMuted}
                />
                <Text style={styles.location} numberOfLines={2}>
                  {restaurant.location}
                </Text>
              </View>
            ) : null}

            <StudentStatusPill
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
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={16}
                    color={studentPalette.textMuted}
                  />
                  <Text style={styles.timeValue} numberOfLines={1}>
                    {restaurant.openingTime} - {restaurant.closingTime}
                  </Text>
                </View>
              ) : null}

              {!isDisabled ? (
                <View style={styles.cardAction}>
                  <Text style={styles.cardActionText}>Ver menú</Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>

      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  touchable: {
    borderRadius: 24,
  },
  card: {
    flexDirection: "row",
    gap: spacing.sm,
    borderRadius: 22,
    borderColor: studentPalette.border,
    backgroundColor: studentPalette.card,
    padding: spacing.md,
    shadowColor: studentPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.992 }],
  },
  disabled: {
    opacity: 0.65,
  },
  visual: {
    width: 68,
    height: 78,
    borderRadius: 18,
  },
  content: {
    flex: 1,
    minWidth: 0,
    justifyContent: "space-between",
  },
  headerText: {
    gap: spacing.xs,
  },
  name: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: studentPalette.textPrimary,
    lineHeight: typography.lineHeights.md,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
  },
  location: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: studentPalette.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
  description: {
    marginTop: spacing.sm,
    fontSize: typography.sizes.sm,
    color: studentPalette.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
  footer: {
    marginTop: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  schedule: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  timeValue: {
    fontSize: typography.sizes.sm,
    color: studentPalette.textSecondary,
    fontWeight: typography.weights.semiBold,
    lineHeight: typography.lineHeights.sm,
  },
  cardAction: {
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "auto",
    paddingHorizontal: spacing.md,
    borderRadius: 14,
    backgroundColor: studentPalette.primary,
    shadowColor: studentPalette.primary,
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardActionText: {
    fontSize: typography.sizes.sm,
    color: studentPalette.card,
    fontWeight: typography.weights.bold,
  },
});
