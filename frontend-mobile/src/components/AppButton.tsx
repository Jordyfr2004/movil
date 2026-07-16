import React from "react";
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, ViewStyle } from "react-native";
import { designSystem, typography } from "../theme";
import { spacing } from "../constants/spacing";
import { useThemeColors } from "../hooks/useThemeColors";

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
  const theme = useThemeColors();
  const isDisabled = disabled || loading;
  const isDanger = variant === "danger" || variant === "destructive";
  const onPrimary = theme.textInverted;

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
        variant === "primary" && { backgroundColor: theme.primary },
        variant === "secondary" && styles.secondary,
        variant === "secondary" && {
          backgroundColor: theme.primaryFaint,
          borderColor: theme.primarySoft,
        },
        variant === "outline" && styles.outline,
        variant === "outline" && { borderColor: theme.borderStrong },
        variant === "ghost" && styles.ghost,
        isDanger && styles.danger,
        isDanger && {
          backgroundColor: theme.dangerSoft,
          borderColor: theme.dangerBorder,
        },
        variant === "floating" && {
          backgroundColor: theme.primary,
          borderRadius: designSystem.radii.floating,
        },
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
              ? onPrimary
              : theme.primary
          }
        />
      ) : null}
      <Text
        style={[
          styles.label,
          size === "sm" && styles.labelSm,
          size === "lg" && styles.labelLg,
          (variant === "primary" || variant === "floating")
            ? { color: onPrimary }
            : isDanger
              ? { color: theme.danger }
              : variant === "ghost"
                ? { color: theme.textSecondary }
                : { color: theme.primary },
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
  secondary: {
    borderWidth: 1,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  danger: {
    borderWidth: 1,
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
});
