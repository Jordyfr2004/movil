import React from "react";
import {
  StyleProp,
  StyleSheet,
  View,
  ViewProps,
  ViewStyle,
} from "react-native";

import { spacing } from "../constants/spacing";
import { colors, designSystem } from "../theme";

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
        variant === "muted" && styles.muted,
        variant === "compact" && styles.compact,
        variant === "horizontal" && styles.horizontal,
        variant === "featured" && styles.featured,
        variant === "elevated" && styles.elevated,
        variant === "interactive" && styles.interactive,
        variant === "empty" && styles.empty,
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
    borderColor: colors.border,
    padding: spacing.cardPadding,
    backgroundColor: colors.surface,
  },
  default: {
    ...designSystem.shadows.low,
  },
  muted: {
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.divider,
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
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.primarySoft,
    ...designSystem.shadows.medium,
  },
  elevated: {
    backgroundColor: colors.surfaceElevated,
    ...designSystem.shadows.medium,
  },
  interactive: {
    backgroundColor: colors.surfaceElevated,
    ...designSystem.shadows.low,
  },
  empty: {
    borderStyle: "dashed",
    backgroundColor: colors.surfaceSecondary,
    ...designSystem.shadows.none,
  },
});
