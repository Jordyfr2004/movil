import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { spacing } from "../constants/spacing";
import { designSystem, typography } from "../theme";
import { AppButton } from "./AppButton";

type ErrorStateProps = {
  title: string;
  message: string;
  onRetry?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function ErrorState({ title, message, onRetry, style }: ErrorStateProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.icon}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={designSystem.iconSizes.lg}
          color={designSystem.colors.danger}
        />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
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
    backgroundColor: designSystem.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: designSystem.colors.dangerBorder,
    ...designSystem.shadows.low,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: designSystem.radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: designSystem.colors.dangerSoft,
  },
  title: {
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    textAlign: "center",
  },
  message: {
    color: designSystem.colors.textSecondary,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    textAlign: "center",
  },
});
