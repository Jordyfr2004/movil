import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { spacing } from "../constants/spacing";
import { designSystem, typography } from "../theme";

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionIcon?: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  onActionPress?: () => void;
};

export function AppHeader({
  title,
  subtitle,
  actionIcon,
  actionLabel,
  onActionPress,
}: AppHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {onActionPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel ?? title}
          hitSlop={10}
          onPress={onActionPress}
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.actionButtonPressed,
          ]}
        >
          {actionIcon ? (
            <MaterialCommunityIcons
              name={actionIcon}
              size={designSystem.iconSizes.md}
              color={designSystem.colors.primary}
            />
          ) : null}
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: designSystem.colors.textPrimary,
    fontSize: typography.roles.screenTitle.fontSize,
    lineHeight: typography.roles.screenTitle.lineHeight,
    fontWeight: typography.roles.screenTitle.fontWeight,
    letterSpacing: typography.roles.screenTitle.letterSpacing,
  },
  subtitle: {
    marginTop: spacing.xs,
    color: designSystem.colors.textSecondary,
    fontSize: typography.roles.bodySmall.fontSize,
    lineHeight: typography.roles.bodySmall.lineHeight,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: designSystem.radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: designSystem.colors.surface,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
    ...designSystem.shadows.low,
  },
  actionButtonPressed: {
    transform: [{ scale: 0.96 }],
    backgroundColor: designSystem.colors.surfacePressed,
  },
});
