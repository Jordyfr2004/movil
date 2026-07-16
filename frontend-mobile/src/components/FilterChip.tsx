import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { spacing } from "../constants/spacing";
import { useThemeColors } from "../hooks/useThemeColors";
import { designSystem, typography } from "../theme";

type FilterChipProps = {
  label: string;
  iconName?: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  selected?: boolean;
  tone?: "neutral" | "success" | "warning" | "error";
  onPress?: () => void;
};

export function FilterChip({
  label,
  iconName,
  selected = false,
  tone = "neutral",
  onPress,
}: FilterChipProps) {
  const theme = useThemeColors();
  const toneStyle = getChipTone(tone, theme);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          borderColor: selected ? toneStyle.color : toneStyle.borderColor,
          backgroundColor: selected ? toneStyle.color : toneStyle.backgroundColor,
        },
        pressed && styles.pressed,
      ]}
    >
      {iconName ? (
        <MaterialCommunityIcons
          name={iconName}
          size={designSystem.iconSizes.sm}
          color={
            selected
              ? theme.textInverted
              : toneStyle.color
          }
        />
      ) : null}
      <Text
        style={[
          styles.text,
          { color: selected ? theme.textInverted : toneStyle.color },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function getChipTone(
  tone: NonNullable<FilterChipProps["tone"]>,
  theme: ReturnType<typeof useThemeColors>
) {
  switch (tone) {
    case "success":
      return {
        color: theme.success,
        backgroundColor: theme.successSoft,
        borderColor: theme.successBorder,
      };
    case "warning":
      return {
        color: theme.warning,
        backgroundColor: theme.warningSoft,
        borderColor: theme.warningBorder,
      };
    case "error":
      return {
        color: theme.danger,
        backgroundColor: theme.dangerSoft,
        borderColor: theme.dangerBorder,
      };
    case "neutral":
    default:
      return {
        color: theme.textSecondary,
        backgroundColor: theme.surface,
        borderColor: theme.border,
      };
  }
}

const styles = StyleSheet.create({
  chip: {
    minHeight: designSystem.spacing.chipHeight,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: designSystem.radii.chip,
    borderWidth: 1,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  text: {
    fontSize: typography.roles.label.fontSize,
    lineHeight: typography.roles.label.lineHeight,
    fontWeight: typography.roles.label.fontWeight,
    letterSpacing: typography.roles.label.letterSpacing,
  },
});
