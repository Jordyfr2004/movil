import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { typography } from "../theme";
import { studentPalette } from "../theme/studentPalette";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

type StudentVisualPlaceholderProps = {
  iconName?: IconName;
  initial?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  variant?: "restaurant" | "dish" | "profile" | "reservation";
  style?: StyleProp<ViewStyle>;
};

const sizeStyles = StyleSheet.create({
  sm: {
    width: 52,
    height: 52,
    borderRadius: 16,
  },
  md: {
    width: 76,
    height: 76,
    borderRadius: 20,
  },
  lg: {
    minHeight: 96,
    borderRadius: 22,
  },
});

const variantStyles = StyleSheet.create({
  restaurant: {
    backgroundColor: studentPalette.primaryPale,
  },
  dish: {
    backgroundColor: studentPalette.cardMuted,
  },
  profile: {
    backgroundColor: studentPalette.primaryFaint,
  },
  reservation: {
    backgroundColor: studentPalette.warningSoft,
  },
});

export function StudentVisualPlaceholder({
  iconName = "silverware-fork-knife",
  initial,
  label,
  size = "md",
  variant = "restaurant",
  style,
}: StudentVisualPlaceholderProps) {
  const sizeStyle = sizeStyles[size];
  const variantStyle = variantStyles[variant];

  return (
    <View
      style={[
        styles.base,
        sizeStyle,
        variantStyle,
        style,
      ]}
      accessible
      accessibilityLabel={label}
      accessibilityRole="image"
    >
      <View style={styles.circleLarge} />
      <View style={styles.circleSmall} />
      <View style={styles.iconShell}>
        {initial ? (
          <Text style={styles.initial} numberOfLines={1}>
            {initial}
          </Text>
        ) : (
          <MaterialCommunityIcons
            name={iconName}
            size={size === "sm" ? 22 : size === "lg" ? 34 : 28}
            color={studentPalette.primary}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    position: "relative",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: studentPalette.border,
    backgroundColor: studentPalette.primaryPale,
  },
  circleLarge: {
    position: "absolute",
    width: 92,
    height: 92,
    borderRadius: 999,
    right: -34,
    bottom: -34,
    backgroundColor: studentPalette.decorOrangeSoft,
  },
  circleSmall: {
    position: "absolute",
    width: 42,
    height: 42,
    borderRadius: 999,
    top: -14,
    left: -12,
    backgroundColor: studentPalette.cardElevated,
    opacity: 0.72,
  },
  iconShell: {
    minWidth: 40,
    minHeight: 40,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    backgroundColor: studentPalette.cardElevated,
    borderWidth: 1,
    borderColor: studentPalette.primarySoft,
  },
  initial: {
    fontSize: typography.sizes.lg,
    lineHeight: typography.lineHeights.lg,
    fontWeight: typography.weights.bold,
    color: studentPalette.primary,
  },
});
