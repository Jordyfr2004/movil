import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { spacing } from "../constants/spacing";
import { designSystem, typography } from "../theme";

type FilterChipProps = {
  label: string;
  iconName?: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  selected?: boolean;
  onPress?: () => void;
};

export function FilterChip({
  label,
  iconName,
  selected = false,
  onPress,
}: FilterChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      {iconName ? (
        <MaterialCommunityIcons
          name={iconName}
          size={designSystem.iconSizes.sm}
          color={
            selected
              ? designSystem.colors.textInverted
              : designSystem.colors.primary
          }
        />
      ) : null}
      <Text style={[styles.text, selected && styles.selectedText]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: designSystem.radii.pill,
    backgroundColor: designSystem.colors.surface,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
  },
  selected: {
    backgroundColor: designSystem.colors.primary,
    borderColor: designSystem.colors.primary,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  text: {
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
  },
  selectedText: {
    color: designSystem.colors.textInverted,
  },
});
