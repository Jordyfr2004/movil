import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { spacing } from "../constants/spacing";
import { useReduceMotion } from "../hooks/useReduceMotion";
import { designSystem } from "../theme";

type SkeletonCardProps = {
  compact?: boolean;
};

export function SkeletonCard({ compact = false }: SkeletonCardProps) {
  const reduceMotion = useReduceMotion();
  const opacity = useRef(new Animated.Value(0.46)).current;

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(0.62);
      return undefined;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: designSystem.animation.slow,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.46,
          duration: designSystem.animation.slow,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [opacity, reduceMotion]);

  return (
    <Animated.View style={[styles.card, compact && styles.compact, { opacity }]}>
      <View style={[styles.block, styles.media]} />
      <View style={styles.content}>
        <View style={[styles.block, styles.title]} />
        <View style={[styles.block, styles.line]} />
        <View style={[styles.block, styles.shortLine]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: designSystem.radii.xl,
    backgroundColor: designSystem.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
    overflow: "hidden",
    ...designSystem.shadows.low,
  },
  compact: {
    width: 220,
  },
  block: {
    backgroundColor: designSystem.colors.skeletonBase,
  },
  media: {
    height: 104,
    margin: spacing.sm,
    marginBottom: 0,
    borderRadius: designSystem.radii.lg,
  },
  content: {
    padding: spacing.sm,
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
});
