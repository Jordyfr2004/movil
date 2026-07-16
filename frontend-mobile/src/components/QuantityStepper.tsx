import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { spacing } from "../constants/spacing";
import { useReduceMotion } from "../hooks/useReduceMotion";
import { useThemeColors } from "../hooks/useThemeColors";
import { designSystem, typography } from "../theme";
import { triggerFeedback } from "../utils/haptics";

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
  const theme = useThemeColors();
  const reduceMotion = useReduceMotion();
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (reduceMotion) {
      scale.setValue(1);
      return;
    }

    scale.setValue(0.92);
    Animated.spring(scale, {
      toValue: 1,
      ...designSystem.motion.spring,
      useNativeDriver: true,
    }).start();
  }, [reduceMotion, scale, value]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surfaceSecondary,
          borderColor: theme.border,
        },
        disabled && styles.disabled,
      ]}
    >
      <StepButton
        iconName="minus"
        disabled={disabled || value <= 1}
        onPress={() => {
          void triggerFeedback("selection");
          onChange(value - 1);
        }}
      />
      <Animated.Text
        style={[
          styles.value,
          { color: theme.textPrimary, transform: [{ scale }] },
        ]}
      >
        {value}
      </Animated.Text>
      <StepButton
        iconName="plus"
        disabled={disabled || value >= 99}
        onPress={() => {
          void triggerFeedback("selection");
          onChange(value + 1);
        }}
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
  const theme = useThemeColors();

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: theme.surfaceElevated,
          borderColor: theme.primarySoft,
        },
        pressed && !disabled && styles.pressed,
        disabled && styles.buttonDisabled,
      ]}
    >
      <MaterialCommunityIcons
        name={iconName}
        size={designSystem.iconSizes.sm}
        color={disabled ? theme.textDisabled : theme.primary}
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
    borderWidth: 1,
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
    borderWidth: 1,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  pressed: {
    transform: [{ scale: 0.94 }],
  },
  value: {
    minWidth: 24,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    textAlign: "center",
  },
});
