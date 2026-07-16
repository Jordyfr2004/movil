import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { spacing } from "../constants/spacing";
import { designSystem, typography } from "../theme";

type StatusBadgeProps = {
  label: string;
  tone: "success" | "danger" | "warning" | "info" | "neutral";
};

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  const toneStyle = getToneStyle(tone);
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

function getToneStyle(tone: StatusBadgeProps["tone"]) {
  switch (tone) {
    case "success":
      return {
        color: designSystem.colors.success,
        backgroundColor: designSystem.colors.successSoft,
        borderColor: designSystem.colors.successBorder,
      };
    case "danger":
      return {
        color: designSystem.colors.danger,
        backgroundColor: designSystem.colors.dangerSoft,
        borderColor: designSystem.colors.dangerBorder,
      };
    case "warning":
      return {
        color: designSystem.colors.warning,
        backgroundColor: designSystem.colors.warningSoft,
        borderColor: designSystem.colors.warningBorder,
      };
    case "info":
      return {
        color: designSystem.colors.info,
        backgroundColor: designSystem.colors.infoSoft,
        borderColor: designSystem.colors.infoBorder,
      };
    case "neutral":
    default:
      return {
        color: designSystem.colors.neutral,
        backgroundColor: designSystem.colors.neutralSoft,
        borderColor: designSystem.colors.neutralBorder,
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
