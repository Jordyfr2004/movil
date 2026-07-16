import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { spacing } from "../constants/spacing";
import { designSystem, typography } from "../theme";

type StatusBadgeProps = {
  label: string;
  tone: "success" | "danger" | "warning" | "info" | "neutral";
};

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  const toneStyle = getToneStyle(tone);

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: toneStyle.backgroundColor,
          borderColor: toneStyle.borderColor,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: toneStyle.color }]} />
      <Text style={[styles.text, { color: toneStyle.color }]}>
        {label}
      </Text>
    </View>
  );
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
    minHeight: 26,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 999,
  },
  text: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
  },
});
