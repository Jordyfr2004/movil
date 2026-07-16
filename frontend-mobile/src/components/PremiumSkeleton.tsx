import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { spacing } from "../constants/spacing";
import { useReduceMotion } from "../hooks/useReduceMotion";
import { useThemeColors } from "../hooks/useThemeColors";
import { designSystem } from "../theme";

type SkeletonKind =
  | "restaurant"
  | "dish"
  | "order"
  | "profile"
  | "tracking"
  | "checkout";

type PremiumSkeletonProps = {
  kind?: SkeletonKind;
  compact?: boolean;
};

export function PremiumSkeleton({
  kind = "restaurant",
  compact = false,
}: PremiumSkeletonProps) {
  const theme = useThemeColors();
  const reduceMotion = useReduceMotion();
  const opacity = useRef(new Animated.Value(0.48)).current;

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(0.68);
      return undefined;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.92,
          duration: designSystem.motion.slow,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.48,
          duration: designSystem.motion.slow,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [opacity, reduceMotion]);

  const blockStyle = { backgroundColor: theme.skeletonBase };

  return (
    <Animated.View
      style={[
        styles.card,
        compact && styles.compact,
        {
          opacity,
          backgroundColor: theme.surfaceElevated,
          borderColor: theme.border,
        },
      ]}
    >
      {kind === "profile" ? (
        <View style={styles.profileRow}>
          <View style={[styles.avatar, blockStyle]} />
          <View style={styles.grow}>
            <View style={[styles.title, blockStyle]} />
            <View style={[styles.shortLine, blockStyle]} />
          </View>
        </View>
      ) : (
        <View
          style={[
            styles.media,
            kind === "order" && styles.mediaOrder,
            kind === "tracking" && styles.mediaTracking,
            kind === "checkout" && styles.mediaCheckout,
            blockStyle,
          ]}
        />
      )}

      <View style={styles.content}>
        <View style={[styles.title, blockStyle]} />
        <View style={[styles.line, blockStyle]} />
        <View style={[styles.shortLine, blockStyle]} />
        {(kind === "order" || kind === "checkout" || kind === "tracking") ? (
          <View style={[styles.footerLine, blockStyle]} />
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: designSystem.radii.xl,
    borderWidth: 1,
    overflow: "hidden",
    ...designSystem.shadows.low,
  },
  compact: {
    width: 220,
  },
  media: {
    height: 104,
    margin: spacing.sm,
    marginBottom: 0,
    borderRadius: designSystem.radii.lg,
  },
  mediaOrder: {
    height: 36,
  },
  mediaTracking: {
    height: 54,
  },
  mediaCheckout: {
    height: 72,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    paddingBottom: 0,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: designSystem.radii.pill,
  },
  grow: {
    flex: 1,
    gap: spacing.sm,
  },
  content: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: {
    width: "70%",
    height: 20,
    borderRadius: designSystem.radii.sm,
  },
  line: {
    width: "92%",
    height: 14,
    borderRadius: designSystem.radii.sm,
  },
  shortLine: {
    width: "48%",
    height: 14,
    borderRadius: designSystem.radii.sm,
  },
  footerLine: {
    width: "62%",
    height: 28,
    borderRadius: designSystem.radii.pill,
  },
});

