import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { spacing } from "../../constants/spacing";
import { colors, typography } from "../../theme";
import type { Restaurant } from "../../types/models";
import { Card } from "../Card";
import { StatusBadge } from "../StatusBadge";
import { RestaurantDetailSchedule } from "./RestaurantDetailSchedule";

type RestaurantDetailHeaderProps = {
  restaurant: Restaurant;
  initial: string;
};

export function RestaurantDetailHeader({
  restaurant,
  initial,
}: RestaurantDetailHeaderProps) {
  return (
    <Card style={styles.hero}>
      <View style={styles.heroHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>

        <View style={styles.heroText}>
          <Text style={styles.name} numberOfLines={2}>
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

      {restaurant.openingTime && restaurant.closingTime ? (
        <View style={styles.metaRow}>
          <RestaurantDetailSchedule
            openingTime={restaurant.openingTime}
            closingTime={restaurant.closingTime}
          />
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginBottom: spacing.lg,
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  heroText: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeights.xl,
  },
  location: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
  metaRow: {
    marginTop: spacing.lg,
  },
});
