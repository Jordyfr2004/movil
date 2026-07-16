import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { spacing } from "../constants/spacing";
import { designSystem, typography } from "../theme";

type QuantityStepperProps = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

export function QuantityStepper({
  value,
  onChange,
  disabled = false,
}: QuantityStepperProps) {
  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      <StepButton
        iconName="minus"
        disabled={disabled || value <= 1}
        onPress={() => onChange(value - 1)}
      />
      <Text style={styles.value}>{value}</Text>
      <StepButton
        iconName="plus"
        disabled={disabled || value >= 99}
        onPress={() => onChange(value + 1)}
      />
    </View>
  );
}

function StepButton({
  disabled,
  iconName,
  onPress,
}: {
  disabled: boolean;
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && !disabled && styles.pressed,
        disabled && styles.buttonDisabled,
      ]}
    >
      <MaterialCommunityIcons
        name={iconName}
        size={designSystem.iconSizes.sm}
        color={designSystem.colors.primary}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    padding: spacing.xs,
    borderRadius: designSystem.radii.pill,
    backgroundColor: designSystem.colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
  },
  disabled: {
    opacity: 0.55,
  },
  button: {
    width: 34,
    height: 34,
    borderRadius: designSystem.radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: designSystem.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: designSystem.colors.primarySoft,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  pressed: {
    transform: [{ scale: 0.94 }],
  },
  value: {
    minWidth: 24,
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    textAlign: "center",
  },
});
