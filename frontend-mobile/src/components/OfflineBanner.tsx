import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { spacing } from "../constants/spacing";
import { useReduceMotion } from "../hooks/useReduceMotion";
import { useThemeColors } from "../hooks/useThemeColors";
import { designSystem, typography } from "../theme";

type OfflineBannerProps = {
  visible: boolean;
  message?: string;
  onRetry?: () => void;
};

export function OfflineBanner({
  visible,
  message = "Sin conexión. Mostrando la información disponible.",
  onRetry,
}: OfflineBannerProps) {
  const theme = useThemeColors();
  const reduceMotion = useReduceMotion();
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(visible ? 0 : 10)).current;

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(visible ? 1 : 0);
      translateY.setValue(visible ? 0 : 10);
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: designSystem.motion.fast,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: visible ? 0 : 10,
        duration: designSystem.motion.fast,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, reduceMotion, translateY, visible]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
          backgroundColor: theme.warningSoft,
          borderColor: theme.warningBorder,
        },
      ]}
      accessible
      accessibilityRole="alert"
      accessibilityLabel={message}
    >
      <MaterialCommunityIcons
        name="wifi-off"
        size={designSystem.iconSizes.sm}
        color={theme.warning}
      />
      <Text style={[styles.text, { color: theme.warning }]}>{message}</Text>
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reintentar conexión"
          onPress={onRetry}
          style={[
            styles.retryButton,
            {
              backgroundColor: theme.surfaceElevated,
              borderColor: theme.warningBorder,
            },
          ]}
        >
          <Text style={[styles.retryText, { color: theme.warning }]}>
            Reintentar
          </Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: designSystem.radii.md,
    borderWidth: 1,
  },
  text: {
    flex: 1,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    fontWeight: typography.weights.semiBold,
  },
  retryButton: {
    minHeight: 32,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: designSystem.radii.pill,
    borderWidth: 1,
  },
  retryText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
});
