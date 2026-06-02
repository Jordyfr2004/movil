import React, { ComponentProps } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { spacing } from "../../constants/spacing";
import { typography } from "../../theme";
import {
  COMMUNITY_ICON_BG,
  COMMUNITY_ICON_BORDER,
  STUDENT_ICON_BG,
  STUDENT_ICON_BORDER,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  WelcomeLayoutMetrics,
} from "./welcomeTheme";

type WelcomeOptionCardProps = {
  title: string;
  subtitle: string;
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  iconColor: string;
  onPress: () => void;
  variant: "student" | "community";
  metrics: WelcomeLayoutMetrics;
  isCompact: boolean;
  accessibilityLabel: string;
  disabled?: boolean;
};

const iconShellByVariant = {
  student: {
    backgroundColor: STUDENT_ICON_BG,
    borderColor: STUDENT_ICON_BORDER,
  },
  community: {
    backgroundColor: COMMUNITY_ICON_BG,
    borderColor: COMMUNITY_ICON_BORDER,
  },
} as const;

export function WelcomeOptionCard({
  title,
  subtitle,
  icon,
  iconColor,
  onPress,
  variant,
  metrics,
  isCompact,
  accessibilityLabel,
  disabled = false,
}: WelcomeOptionCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.optionCard,
        {
          minHeight: metrics.cardMinHeight,
          borderRadius: metrics.cardRadius,
          paddingVertical: metrics.cardPaddingVertical,
        },
        pressed && !disabled && styles.optionPressed,
        disabled && styles.optionDisabled,
      ]}
    >
      <View
        style={[
          styles.optionIconShell,
          {
            width: metrics.cardIconShellSize,
            height: metrics.cardIconShellSize,
            borderRadius: metrics.cardIconShellRadius,
          },
          iconShellByVariant[variant],
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={isCompact ? 30 : 34}
          color={iconColor}
        />
      </View>

      <Text style={styles.optionTitle}>{title}</Text>
      <Text style={styles.optionSubtitle}>{subtitle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  optionCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(231, 225, 218, 0.94)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    shadowColor: "#34241C",
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  optionPressed: {
    opacity: 0.96,
    transform: [{ translateY: 1 }, { scale: 0.988 }],
  },
  optionDisabled: {
    opacity: 0.6,
  },
  optionIconShell: {
    marginBottom: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  optionTitle: {
    color: TEXT_PRIMARY,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.md,
    textAlign: "center",
  },
  optionSubtitle: {
    marginTop: spacing.xs,
    color: TEXT_SECONDARY,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    textAlign: "center",
  },
});
