import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { spacing } from "../constants/spacing";
import { useThemeColors } from "../hooks/useThemeColors";
import { designSystem, typography } from "../theme";
import { AppButton } from "./AppButton";

type ErrorStateProps = {
  title: string;
  message: string;
  onRetry?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function ErrorState({ title, message, onRetry, style }: ErrorStateProps) {
  const theme = useThemeColors();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surfaceElevated,
          borderColor: theme.dangerBorder,
        },
        style,
      ]}
    >
      <View style={[styles.icon, { backgroundColor: theme.dangerSoft }]}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={designSystem.iconSizes.lg}
          color={theme.danger}
        />
      </View>
      <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
      <Text style={[styles.message, { color: theme.textSecondary }]}>
        {message}
      </Text>
      {onRetry ? (
        <AppButton label="Reintentar" onPress={onRetry} size="sm" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: designSystem.radii.xl,
    borderWidth: 1,
    ...designSystem.shadows.low,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: designSystem.radii.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    textAlign: "center",
  },
  message: {
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    textAlign: "center",
  },
});
