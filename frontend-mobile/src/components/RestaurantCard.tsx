import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { spacing } from "../constants/spacing";
import { useFavorites } from "../context/FavoritesContext";
import { useReduceMotion } from "../hooks/useReduceMotion";
import { designSystem, typography } from "../theme";
import { Restaurant } from "../types/models";
import { StatusBadge } from "./StatusBadge";

type RestaurantStatus = {
  label: string;
  tone: React.ComponentProps<typeof StatusBadge>["tone"];
};

type RestaurantCardProps = {
  restaurant: Restaurant;
  onPress?: (restaurant: Restaurant) => void;
  disabled?: boolean;
  compact?: boolean;
  variant?: "default" | "featured";
  index?: number;
  style?: StyleProp<ViewStyle>;
};

function parseTimeToMinutes(value?: string) {
  if (!value) {
    return null;
  }

  const match = value.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) {
    return null;
  }

  return hours * 60 + minutes;
}

function formatTime(value?: string) {
  if (!value) {
    return null;
  }

  const match = value.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) {
    return null;
  }

  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

function getRestaurantStatus(restaurant: Restaurant): RestaurantStatus {
  if (!restaurant.isActive) {
    return { label: "Cerrado", tone: "danger" };
  }

  const opening = parseTimeToMinutes(restaurant.openingTime);
  const closing = parseTimeToMinutes(restaurant.closingTime);

  if (opening === null || closing === null) {
    return { label: "Disponible", tone: "neutral" };
  }

  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  const isOpen =
    closing > opening
      ? current >= opening && current <= closing
      : current >= opening || current <= closing;

  if (!isOpen) {
    return { label: "Cerrado", tone: "danger" };
  }

  const minutesUntilClose =
    closing >= current ? closing - current : 24 * 60 - current + closing;

  if (minutesUntilClose <= 30) {
    return { label: "Cierra pronto", tone: "warning" };
  }

  return { label: "Abierto", tone: "success" };
}

export function RestaurantCard({
  restaurant,
  onPress,
  disabled = false,
  compact = false,
  variant = "default",
  index = 0,
  style,
}: RestaurantCardProps) {
  const reduceMotion = useReduceMotion();
  const opacity = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(reduceMotion ? 0 : 14)).current;
  const isDisabled = disabled || !onPress;
  const status = getRestaurantStatus(restaurant);
  const { isRestaurantFavorite, toggleRestaurant } = useFavorites();
  const favorite = isRestaurantFavorite(restaurant.id);
  const openingTime = formatTime(restaurant.openingTime);
  const closingTime = formatTime(restaurant.closingTime);
  const hasSchedule = Boolean(openingTime && closingTime);
  const isFeatured = variant === "featured";

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
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver restaurante ${restaurant.name}`}
        onPress={onPress ? () => onPress(restaurant) : undefined}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.card,
          compact && styles.compactCard,
          isFeatured && styles.featuredCard,
          pressed && !isDisabled && styles.pressed,
          isDisabled && styles.disabled,
        ]}
      >
        <View
          style={[
            styles.media,
            compact && styles.compactMedia,
            isFeatured && styles.featuredMedia,
          ]}
        >
          {restaurant.imageUrl ? (
            <Image source={{ uri: restaurant.imageUrl }} style={styles.image} />
          ) : (
            <View style={styles.placeholder}>
              <MaterialCommunityIcons
                name={isFeatured ? "silverware-fork-knife" : "storefront-outline"}
                size={isFeatured ? designSystem.iconSizes.lg : designSystem.iconSizes.xl}
                color={designSystem.colors.primary}
              />
              <Text style={styles.placeholderText} numberOfLines={1}>
                {restaurant.name}
              </Text>
            </View>
          )}

          <View style={styles.status}>
            <StatusBadge label={status.label} tone={status.tone} />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              favorite ? "Quitar de favoritos" : "Guardar en favoritos"
            }
            onPress={(event) => {
              event.stopPropagation();
              toggleRestaurant(restaurant);
            }}
            style={styles.favoriteButton}
          >
            <MaterialCommunityIcons
              name={favorite ? "heart" : "heart-outline"}
              size={designSystem.iconSizes.md}
              color={designSystem.colors.primary}
            />
          </Pressable>
        </View>

        <View style={styles.content}>
          <Text
            style={[styles.name, compact && styles.compactName]}
            numberOfLines={2}
          >
            {restaurant.name}
          </Text>

          {!isFeatured && restaurant.location ? (
            <View style={styles.metaRow}>
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={designSystem.iconSizes.sm}
                color={designSystem.colors.textMuted}
              />
              <Text style={styles.metaText} numberOfLines={1}>
                {restaurant.location}
              </Text>
            </View>
          ) : null}

          {!isFeatured && hasSchedule ? (
            <View style={styles.metaRow}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={designSystem.iconSizes.sm}
                color={designSystem.colors.textMuted}
              />
              <Text style={styles.metaText}>
                {openingTime} - {closingTime}
              </Text>
            </View>
          ) : null}

          {!isFeatured && restaurant.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {restaurant.description}
            </Text>
          ) : null}

          {!isDisabled ? (
            <View style={styles.actionRow}>
              <Text style={styles.actionText}>Ver menú</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={designSystem.iconSizes.md}
                color={designSystem.colors.primary}
              />
            </View>
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: designSystem.radii.xl,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
    backgroundColor: designSystem.colors.surface,
    overflow: "hidden",
    ...designSystem.shadows.sm,
  },
  compactCard: {
    width: 210,
  },
  featuredCard: {
    borderColor: "rgba(240, 223, 201, 0.70)",
  },
  pressed: {
    transform: [{ scale: 0.985 }],
    backgroundColor: designSystem.colors.surfacePressed,
  },
  disabled: {
    opacity: 0.68,
  },
  media: {
    height: 116,
    margin: spacing.sm,
    marginBottom: 0,
    borderRadius: designSystem.radii.lg,
    overflow: "hidden",
    backgroundColor: designSystem.colors.primaryFaint,
  },
  compactMedia: {
    height: 88,
  },
  featuredMedia: {
    height: 92,
    backgroundColor: designSystem.colors.primaryFaint,
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
    padding: spacing.md,
  },
  placeholderText: {
    maxWidth: "90%",
    color: designSystem.colors.primary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    textAlign: "center",
  },
  status: {
    position: "absolute",
    top: spacing.xs,
    left: spacing.xs,
  },
  favoriteButton: {
    position: "absolute",
    top: spacing.xs,
    right: spacing.xs,
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  content: {
    padding: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  name: {
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.lg,
    lineHeight: typography.lineHeights.lg,
    fontWeight: typography.weights.bold,
    textTransform: "capitalize",
  },
  compactName: {
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  metaText: {
    flex: 1,
    color: designSystem.colors.textSecondary,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    fontWeight: typography.weights.semiBold,
  },
  description: {
    color: designSystem.colors.textSecondary,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
  },
  actionRow: {
    marginTop: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  actionText: {
    color: designSystem.colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
});
