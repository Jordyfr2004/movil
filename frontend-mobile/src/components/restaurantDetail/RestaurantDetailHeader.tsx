import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";

import { spacing } from "../../constants/spacing";
import { typography } from "../../theme";
import { studentPalette } from "../../theme/studentPalette";
import type { Restaurant } from "../../types/models";
import { Card } from "../Card";
import { StudentStatusPill } from "../StudentStatusPill";
import { StudentVisualPlaceholder } from "../StudentVisualPlaceholder";
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
          height={58}
          viewBox="0 0 360 58"
          preserveAspectRatio="none"
          style={styles.heroWave}
        >
          <Path
            d="M0 34 C78 16 146 52 224 36 C288 22 329 18 360 28 V58 H0 Z"
            fill={studentPalette.primaryPale}
          />
        </Svg>
        <View style={styles.heroGlow} />
      </View>

      <View style={styles.contentRow}>
        <StudentVisualPlaceholder
          initial={initial}
          label={`Restaurante ${restaurant.name}`}
          size="md"
          style={styles.visual}
          variant="restaurant"
        />

        <View style={styles.heroText}>
          <Text style={styles.name} numberOfLines={2}>
            {restaurant.name}
          </Text>

          {restaurant.location ? (
            <View style={styles.locationRow}>
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={16}
                color={studentPalette.textMuted}
              />
              <Text style={styles.location} numberOfLines={2}>
                {restaurant.location}
              </Text>
            </View>
          ) : null}

          <View style={styles.metaRow}>
            <StudentStatusPill
              label={restaurant.isActive ? "Abierto" : "Cerrado"}
              tone={restaurant.isActive ? "success" : "danger"}
            />

            {restaurant.openingTime && restaurant.closingTime ? (
              <RestaurantDetailSchedule
                openingTime={restaurant.openingTime}
                closingTime={restaurant.closingTime}
              />
            ) : null}
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: 22,
    borderColor: studentPalette.border,
    backgroundColor: studentPalette.cardMuted,
    shadowColor: studentPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
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
  heroGlow: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 999,
    right: -34,
    top: -28,
    backgroundColor: "rgba(247, 101, 2, 0.07)",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  visual: {
    width: 82,
    height: 86,
    minHeight: 86,
    borderRadius: 20,
  },
  heroText: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  name: {
    fontSize: 24,
    fontWeight: typography.weights.bold,
    color: studentPalette.textPrimary,
    lineHeight: 30,
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
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
});
