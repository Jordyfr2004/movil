import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors, typography } from "../theme";
import { spacing } from "../constants/spacing";

type AppButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export function AppButton({ label, onPress, disabled }: AppButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    color: colors.onPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semiBold,
  },
});
