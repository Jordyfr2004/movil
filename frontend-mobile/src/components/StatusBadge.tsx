import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { spacing } from "../constants/spacing";
import { useThemeColors } from "../hooks/useThemeColors";
import { designSystem, typography } from "../theme";

type StatusBadgeProps = {
  label: string;
  tone: "success" | "danger" | "warning" | "info" | "neutral";
};

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  const theme = useThemeColors();
  const toneStyle = getToneStyle(tone, theme);
  const iconName = getToneIcon(tone);

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={label}
      style={[
        styles.badge,
        {
          backgroundColor: toneStyle.backgroundColor,
          borderColor: toneStyle.borderColor,
        },
      ]}
    >
      <MaterialCommunityIcons
        name={iconName}
        size={designSystem.iconSizes.xs}
        color={toneStyle.color}
      />
      <Text style={[styles.text, { color: toneStyle.color }]}>
        {label}
      </Text>
    </View>
  );
}

function getToneIcon(
  tone: StatusBadgeProps["tone"]
): React.ComponentProps<typeof MaterialCommunityIcons>["name"] {
  switch (tone) {
    case "success":
      return "check-circle";
    case "danger":
      return "close-circle";
    case "warning":
      return "clock-alert-outline";
    case "info":
      return "information-outline";
    case "neutral":
    default:
      return "circle-medium";
  }
}

function getToneStyle(
  tone: StatusBadgeProps["tone"],
  theme: ReturnType<typeof useThemeColors>
) {
  switch (tone) {
    case "success":
      return {
        color: theme.success,
        backgroundColor: theme.successSoft,
        borderColor: theme.successBorder,
      };
    case "danger":
      return {
        color: theme.danger,
        backgroundColor: theme.dangerSoft,
        borderColor: theme.dangerBorder,
      };
    case "warning":
      return {
        color: theme.warning,
        backgroundColor: theme.warningSoft,
        borderColor: theme.warningBorder,
      };
    case "info":
      return {
        color: theme.info,
        backgroundColor: theme.infoSoft,
        borderColor: theme.infoBorder,
      };
    case "neutral":
    default:
      return {
        color: theme.neutral,
        backgroundColor: theme.neutralSoft,
        borderColor: theme.neutralBorder,
      };
  }
}

const styles = StyleSheet.create({
  badge: {
    minHeight: 28,
    borderRadius: designSystem.radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  text: {
    fontSize: typography.roles.caption.fontSize,
    lineHeight: typography.roles.caption.lineHeight,
    fontWeight: typography.roles.caption.fontWeight,
    letterSpacing: typography.roles.caption.letterSpacing,
  },
});
