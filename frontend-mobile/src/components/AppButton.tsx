import React from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { colors, typography } from "../theme";
import { spacing } from "../constants/spacing";

type AppButtonVariant = "primary" | "secondary" | "danger";
type AppButtonSize = "md" | "sm";

type AppButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  style?: ViewStyle;
};

export function AppButton({
  label,
  onPress,
  disabled,
  variant = "primary",
  size = "md",
  style,
}: AppButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        size === "sm" ? styles.sizeSm : styles.sizeMd,
        variant === "primary"
          ? styles.primary
          : variant === "secondary"
            ? styles.secondary
            : styles.danger,
        variant === "primary" && styles.primaryShadow,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          size === "sm" && styles.labelSm,
          variant === "primary"
            ? styles.labelOnPrimary
            : variant === "danger"
              ? styles.labelDanger
              : styles.labelSecondary,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  sizeMd: {
    minHeight: 48,
    paddingVertical: spacing.md,
  },
  sizeSm: {
    minHeight: 36,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  danger: {
    backgroundColor: colors.errorSoft,
    borderWidth: 1,
    borderColor: colors.error,
  },
  primaryShadow: {
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.55,
  },
  label: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semiBold,
  },
  labelSm: {
    fontSize: typography.sizes.sm,
  },
  labelOnPrimary: {
    color: colors.onPrimary,
  },
  labelSecondary: {
    color: colors.textPrimary,
  },
  labelDanger: {
    color: colors.error,
  },
});
