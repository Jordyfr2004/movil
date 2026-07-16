import React from "react";
import {
  StyleProp,
  StyleSheet,
  View,
  ViewProps,
  ViewStyle,
} from "react-native";

import { spacing } from "../constants/spacing";
import { colors } from "../theme";

type CardVariant = "default" | "muted";

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
        variant === "muted" ? styles.muted : styles.default,
        style,
      ]}
    >
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(231, 225, 218, 0.72)",
    padding: spacing.lg,
  },
  default: {
    backgroundColor: colors.surface,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 1,
  },
  muted: {
    backgroundColor: colors.surfaceMuted,
  },
});
