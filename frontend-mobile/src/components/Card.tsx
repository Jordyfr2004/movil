import React from "react";
import {
  StyleProp,
  StyleSheet,
  View,
  ViewProps,
  ViewStyle,
} from "react-native";

import { spacing } from "../constants/spacing";
import { useThemeColors } from "../hooks/useThemeColors";
import { designSystem } from "../theme";

type CardVariant =
  | "default"
  | "muted"
  | "compact"
  | "horizontal"
  | "featured"
  | "elevated"
  | "interactive"
  | "empty";

type CardProps = ViewProps & {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  variant?: CardVariant;
};

export function Card({
  children,
  style,
  contentStyle,
  variant = "default",
  ...rest
}: CardProps) {
  const theme = useThemeColors();
  const content = contentStyle ? (
    <View style={contentStyle}>{children}</View>
  ) : (
    children
  );

  return (
    <View
      {...rest}
      style={[
        styles.base,
        { backgroundColor: theme.surface, borderColor: theme.border },
        variant === "muted" && {
          backgroundColor: theme.surfaceSecondary,
          borderColor: theme.divider,
        },
        variant === "compact" && styles.compact,
        variant === "horizontal" && styles.horizontal,
        variant === "featured" && styles.featured,
        variant === "featured" && {
          backgroundColor: theme.surfaceElevated,
          borderColor: theme.primarySoft,
        },
        variant === "elevated" && styles.elevated,
        variant === "elevated" && { backgroundColor: theme.surfaceElevated },
        variant === "interactive" && styles.interactive,
        variant === "interactive" && { backgroundColor: theme.surfaceElevated },
        variant === "empty" && styles.empty,
        variant === "empty" && { backgroundColor: theme.surfaceSecondary },
        variant === "default" && styles.default,
        style,
      ]}
    >
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 20,
    borderWidth: 1,
    padding: spacing.cardPadding,
  },
  default: {
    ...designSystem.shadows.low,
  },
  compact: {
    borderRadius: designSystem.radii.cardSm,
    padding: spacing.md,
    ...designSystem.shadows.low,
  },
  horizontal: {
    borderRadius: designSystem.radii.cardSm,
    padding: spacing.md,
    ...designSystem.shadows.low,
  },
  featured: {
    borderRadius: designSystem.radii.cardLg,
    ...designSystem.shadows.medium,
  },
  elevated: {
    ...designSystem.shadows.medium,
  },
  interactive: {
    ...designSystem.shadows.low,
  },
  empty: {
    borderStyle: "dashed",
    ...designSystem.shadows.none,
  },
});
