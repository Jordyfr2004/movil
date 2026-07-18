import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { spacing } from "../../constants/spacing";
import { useReduceMotion } from "../../hooks/useReduceMotion";
import type { Dish } from "../../services/dishService";
import { designSystem, typography } from "../../theme";
import { studentPalette } from "../../theme/studentPalette";
import { StudentStatusPill } from "../StudentStatusPill";


type RestaurantDishCardProps = {
  dish: Dish;
  index?: number;
  onPress: (dish: Dish) => void;
};

export function RestaurantDishCard({
  dish,
  index = 0,
  onPress,
}: RestaurantDishCardProps) {
  const hasImage = Boolean(dish.imageUrl);
  const reduceMotion = useReduceMotion();
  const opacity = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(reduceMotion ? 0 : 10)).current;

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
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver detalle de ${dish.name}`}
        onPress={() => onPress(dish)}
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
      >
        {hasImage ? (
          <Image
            source={{ uri: dish.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.image} />
        )}

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.dishName} numberOfLines={2}>
              {dish.name}
            </Text>

            {!dish.isAvailable || !dish.isActive ? (
              <StudentStatusPill label="No disponible" tone="neutral" />
            ) : null}
          </View>

          {dish.description ? (
            <Text style={styles.dishMeta} numberOfLines={2}>
              {dish.description}
            </Text>
          ) : null}

          <View style={styles.bottomRow}>
            <Text style={styles.dishPrice} numberOfLines={1}>
              ${dish.price}
            </Text>

            <MaterialCommunityIcons
              name="chevron-right"
              size={designSystem.iconSizes.md}
              color={studentPalette.textMuted}
            />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: designSystem.radii.xl,
    borderWidth: 1,
    borderColor: studentPalette.border,
    backgroundColor: studentPalette.cardElevated,
    shadowColor: studentPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
    backgroundColor: studentPalette.primaryFaint,
  },
  image: {
    width: 98,
    height: 92,
    borderRadius: designSystem.radii.image,
    backgroundColor: studentPalette.primaryFaint,
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  dishName: {
    flex: 1,
    fontSize: typography.roles.cardTitle.fontSize,
    fontWeight: typography.roles.cardTitle.fontWeight,
    color: studentPalette.textPrimary,
    lineHeight: typography.lineHeights.md,
  },
  dishMeta: {
    fontSize: typography.sizes.sm,
    color: studentPalette.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
  bottomRow: {
    marginTop: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  dishPrice: {
    flex: 1,
    minWidth: 58,
    fontSize: typography.roles.price.fontSize,
    fontWeight: typography.roles.price.fontWeight,
    color: studentPalette.primary,
    lineHeight: typography.lineHeights.lg,
  },
});
