import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { spacing } from "../constants/spacing";
import { designSystem, typography } from "../theme";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onActionPress,
}: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {actionLabel && onActionPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          hitSlop={8}
          onPress={onActionPress}
          style={({ pressed }) => [
            styles.action,
            pressed && styles.actionPressed,
          ]}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={designSystem.iconSizes.sm}
            color={designSystem.colors.primary}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 44,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.lg,
    lineHeight: typography.lineHeights.lg,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    marginTop: spacing.xs,
    color: designSystem.colors.textMuted,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.sm,
  },
  actionPressed: {
    opacity: 0.72,
  },
  actionText: {
    color: designSystem.colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
});
