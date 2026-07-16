import React from "react";
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, ViewStyle } from "react-native";
import { colors, designSystem, typography } from "../theme";
import { spacing } from "../constants/spacing";

type AppButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "destructive"
  | "floating";
type AppButtonSize = "md" | "sm" | "lg";

type AppButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

export function AppButton({
  label,
  onPress,
  disabled,
  loading = false,
  variant = "primary",
  size = "md",
  style,
  accessibilityLabel,
  accessibilityHint,
}: AppButtonProps) {
  const isDisabled = disabled || loading;
  const isDanger = variant === "danger" || variant === "destructive";

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: Boolean(isDisabled), busy: loading }}
      style={({ pressed }) => [
        styles.base,
        size === "sm" ? styles.sizeSm : styles.sizeMd,
        size === "lg" && styles.sizeLg,
        variant === "primary" && styles.primary,
        variant === "secondary" && styles.secondary,
        variant === "outline" && styles.outline,
        variant === "ghost" && styles.ghost,
        isDanger && styles.danger,
        variant === "floating" && styles.floating,
        (variant === "primary" || variant === "floating") && styles.primaryShadow,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === "primary" || variant === "floating"
              ? colors.onPrimary
              : colors.primary
          }
        />
      ) : null}
      <Text
        style={[
          styles.label,
          size === "sm" && styles.labelSm,
          size === "lg" && styles.labelLg,
          (variant === "primary" || variant === "floating")
            ? styles.labelOnPrimary
            : isDanger
              ? styles.labelDanger
              : variant === "ghost"
                ? styles.labelGhost
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
    borderRadius: designSystem.radii.button,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  sizeMd: {
    minHeight: designSystem.components.button.heightMd,
    paddingVertical: spacing.md,
  },
  sizeLg: {
    minHeight: designSystem.components.button.heightLg,
    paddingHorizontal: spacing.xl,
  },
  sizeSm: {
    minHeight: designSystem.components.button.heightSm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: designSystem.radii.pill,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.primaryFaint,
    borderWidth: 1,
    borderColor: colors.primarySoft,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  danger: {
    backgroundColor: colors.errorSoft,
    borderWidth: 1,
    borderColor: colors.errorBorder,
  },
  floating: {
    backgroundColor: colors.primary,
    borderRadius: designSystem.radii.floating,
  },
  primaryShadow: {
    ...designSystem.shadows.medium,
  },
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.975 }],
  },
  disabled: {
    opacity: 0.58,
  },
  label: {
    fontSize: typography.roles.button.fontSize,
    lineHeight: typography.roles.button.lineHeight,
    fontWeight: typography.roles.button.fontWeight,
    letterSpacing: typography.roles.button.letterSpacing,
  },
  labelSm: {
    fontSize: typography.sizes.sm,
  },
  labelLg: {
    fontSize: typography.sizes.md,
  },
  labelOnPrimary: {
    color: colors.onPrimary,
  },
  labelSecondary: {
    color: colors.primary,
  },
  labelGhost: {
    color: colors.textSecondary,
  },
  labelDanger: {
    color: colors.error,
  },
});
