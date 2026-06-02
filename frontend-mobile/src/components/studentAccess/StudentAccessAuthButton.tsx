import React, { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { spacing } from "../../constants/spacing";
import { colors, typography } from "../../theme";
import {
  AUTH_BUTTON_BACKGROUND,
  AUTH_BUTTON_BORDER,
  StudentAccessLayoutMetrics,
} from "./studentAccessTheme";

type StudentAccessAuthButtonProps = {
  label: string;
  accessibilityLabel: string;
  leftIcon: ReactNode;
  metrics: StudentAccessLayoutMetrics;
  onPress: () => void;
  disabled?: boolean;
};

export function StudentAccessAuthButton({
  label,
  accessibilityLabel,
  leftIcon,
  metrics,
  onPress,
  disabled = false,
}: StudentAccessAuthButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.authButton,
        {
          minHeight: metrics.authButtonMinHeight,
          borderRadius: metrics.authButtonRadius,
          paddingHorizontal: metrics.authButtonHorizontalPadding,
        },
        pressed && !disabled && styles.authButtonPressed,
      ]}
    >
      <View
        style={[
          styles.authButtonContent,
          {
            minHeight: metrics.authButtonContentMinHeight,
          },
        ]}
      >
        <View
          style={[
            styles.iconSlot,
            {
              width: metrics.iconSlotWidth,
            },
          ]}
          accessible={false}
        >
          {leftIcon}
        </View>

        <Text style={styles.authButtonLabel}>{label}</Text>

        <View
          style={[
            styles.iconSlot,
            {
              width: metrics.iconSlotWidth,
            },
          ]}
          accessible={false}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  authButton: {
    backgroundColor: AUTH_BUTTON_BACKGROUND,
    borderWidth: 1,
    borderColor: AUTH_BUTTON_BORDER,
    shadowColor: "#34241C",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  authButtonPressed: {
    opacity: 0.96,
    transform: [{ translateY: 1 }, { scale: 0.985 }],
  },
  authButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconSlot: {
    alignItems: "center",
    justifyContent: "center",
  },
  authButtonLabel: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semiBold,
    lineHeight: typography.lineHeights.md,
    textAlign: "center",
  },
});
