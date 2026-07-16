import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { spacing } from "../constants/spacing";
import { useCart } from "../context/CartContext";
import { useReduceMotion } from "../hooks/useReduceMotion";
import { designSystem, typography } from "../theme";

type CartFloatingBarProps = {
  bottomOffset: number;
  onPress: () => void;
};

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`;
}

export function CartFloatingBar({ bottomOffset, onPress }: CartFloatingBarProps) {
  const { itemCount, total } = useCart();
  const reduceMotion = useReduceMotion();
  const opacity = useRef(new Animated.Value(itemCount > 0 ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(itemCount > 0 ? 0 : 12)).current;

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(itemCount > 0 ? 1 : 0);
      translateY.setValue(itemCount > 0 ? 0 : 12);
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: itemCount > 0 ? 1 : 0,
        duration: designSystem.animation.normal,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: itemCount > 0 ? 0 : 12,
        duration: designSystem.animation.normal,
        useNativeDriver: true,
      }),
    ]).start();
  }, [itemCount, opacity, reduceMotion, translateY]);

  if (itemCount <= 0) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          bottom: bottomOffset,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ver carrito"
        onPress={onPress}
        style={({ pressed }) => [styles.bar, pressed && styles.pressed]}
      >
        <Text style={styles.text} numberOfLines={1}>
          {itemCount} {itemCount === 1 ? "producto" : "productos"} ·{" "}
          {formatMoney(total)} — Ver carrito
        </Text>
        <MaterialCommunityIcons
          name="cart-outline"
          size={designSystem.iconSizes.md}
          color={designSystem.colors.textInverted}
        />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
  },
  bar: {
    minHeight: 48,
    borderRadius: designSystem.radii.pill,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: designSystem.colors.primary,
    ...designSystem.shadows.md,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
    backgroundColor: designSystem.colors.primaryPressed,
  },
  text: {
    flex: 1,
    color: designSystem.colors.textInverted,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    fontWeight: typography.weights.bold,
    textAlign: "center",
  },
});
