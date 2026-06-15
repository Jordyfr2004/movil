import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";

import {
  DecorBowlIcon,
  DecorLeafIcon,
} from "../login/LoginDecorIcons";
import { spacing } from "../../constants/spacing";
import { typography } from "../../theme";
import { studentPalette } from "../../theme/studentPalette";
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
      <View
        style={styles.heroDecor}
        pointerEvents="none"
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Svg
          width="100%"
          height={84}
          viewBox="0 0 360 84"
          preserveAspectRatio="none"
          style={styles.heroWave}
        >
          <Path
            d="M0 48 C78 24 144 74 224 53 C290 36 329 24 360 38 V84 H0 Z"
            fill={studentPalette.primaryPale}
          />
        </Svg>
        <View style={styles.heroBowl}>
          <DecorBowlIcon color={studentPalette.decorOrange} size={44} />
        </View>
        <View style={styles.heroLeaf}>
          <DecorLeafIcon color={studentPalette.decorOrangeSoft} size={40} />
        </View>
      </View>

      <View style={styles.topLine}>
        <Text style={styles.eyebrow}>RESTAURANTE</Text>
        <StatusBadge
          label={restaurant.isActive ? "Abierto" : "Cerrado"}
          tone={restaurant.isActive ? "success" : "danger"}
        />
      </View>

      <View style={styles.heroHeader}>
        <View style={styles.avatar}>
          <MaterialCommunityIcons
            name="silverware-fork-knife"
            size={24}
            color={studentPalette.primary}
          />
          <Text style={styles.avatarText}>{initial}</Text>
        </View>

        <View style={styles.heroText}>
          <Text style={styles.name} numberOfLines={2}>
            {restaurant.name}
          </Text>
          {restaurant.location ? (
            <View style={styles.locationRow}>
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={16}
                color={studentPalette.primary}
              />
              <Text style={styles.location} numberOfLines={2}>
                {restaurant.location}
              </Text>
            </View>
          ) : null}
        </View>
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
    padding: spacing.lg,
    borderRadius: 22,
    borderColor: studentPalette.border,
    backgroundColor: studentPalette.card,
    shadowColor: studentPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
    overflow: "hidden",
  },
  heroDecor: {
    ...StyleSheet.absoluteFillObject,
  },
  heroWave: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
  },
  heroBowl: {
    position: "absolute",
    top: 42,
    right: 14,
    transform: [{ rotate: "4deg" }],
  },
  heroLeaf: {
    position: "absolute",
    right: 64,
    bottom: -2,
    transform: [{ rotate: "-12deg" }],
  },
  topLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  eyebrow: {
    flex: 1,
    fontSize: typography.sizes.xs,
    color: studentPalette.primary,
    fontWeight: typography.weights.bold,
    letterSpacing: 1.2,
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: studentPalette.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: studentPalette.border,
    shadowColor: studentPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  avatarText: {
    marginTop: -2,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: studentPalette.primary,
  },
  heroText: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: studentPalette.textPrimary,
    lineHeight: typography.lineHeights.xl,
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
  metaRow: {
    marginTop: spacing.md,
  },
});
