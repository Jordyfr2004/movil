import React, { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { spacing } from "../../constants/spacing";
import { useReduceMotion } from "../../hooks/useReduceMotion";
import { designSystem, typography } from "../../theme";
import { studentPalette } from "../../theme/studentPalette";
import type { Restaurant } from "../../types/models";
import { Card } from "../Card";
import { StudentStatusPill } from "../StudentStatusPill";
import { RestaurantDetailSchedule } from "./RestaurantDetailSchedule";

type RestaurantDetailHeaderProps = {
  restaurant: Restaurant;
  initial: string;
};

export function RestaurantDetailHeader({
  restaurant,
  initial,
}: RestaurantDetailHeaderProps) {
  const reduceMotion = useReduceMotion();
  const opacity = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(reduceMotion ? 0 : 12)).current;

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
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: designSystem.animation.normal,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, reduceMotion, translateY]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <Card variant="featured" style={styles.hero}>
        <View style={styles.media}>
          {restaurant.imageUrl ? (
            <Image source={{ uri: restaurant.imageUrl }} style={styles.image} />
          ) : (
            <View style={styles.placeholder}>
              <View style={styles.placeholderGlow} />
              <Text style={styles.placeholderInitial}>{initial}</Text>
              <MaterialCommunityIcons
                name="storefront-outline"
                size={designSystem.iconSizes.md}
                color={studentPalette.primary}
              />
            </View>
          )}
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
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginBottom: spacing.md,
    padding: spacing.sm,
    borderRadius: designSystem.radii.xl,
    overflow: "hidden",
  },
  media: {
    height: 180,
    borderRadius: designSystem.radii.image,
    overflow: "hidden",
    backgroundColor: studentPalette.cardMuted,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    overflow: "hidden",
  },
  placeholderGlow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 999,
    right: -80,
    top: -80,
    backgroundColor: studentPalette.primarySoft,
    opacity: 0.5,
  },
  placeholderInitial: {
    color: studentPalette.primary,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: typography.weights.bold,
  },
  heroText: {
    padding: spacing.sm,
    gap: spacing.xs,
  },
  name: {
    fontSize: typography.roles.heroTitle.fontSize,
    fontWeight: typography.roles.heroTitle.fontWeight,
    color: studentPalette.textPrimary,
    lineHeight: typography.roles.heroTitle.lineHeight,
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
