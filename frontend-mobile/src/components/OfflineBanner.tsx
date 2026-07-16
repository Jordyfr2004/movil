import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { spacing } from "../constants/spacing";
import { designSystem, typography } from "../theme";

type OfflineBannerProps = {
  visible: boolean;
  message?: string;
  onRetry?: () => void;
};

export function OfflineBanner({
  visible,
  message = "Sin conexión. Mostrando la información disponible.",
  onRetry,
}: OfflineBannerProps) {
  if (!visible) {
    return null;
  }

  return (
    <View
      style={styles.container}
      accessible
      accessibilityRole="alert"
      accessibilityLabel={message}
    >
      <MaterialCommunityIcons
        name="wifi-off"
        size={designSystem.iconSizes.sm}
        color={designSystem.colors.warning}
      />
      <Text style={styles.text}>{message}</Text>
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reintentar conexión"
          onPress={onRetry}
          style={styles.retryButton}
        >
          <Text style={styles.retryText}>Reintentar</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: designSystem.radii.md,
    backgroundColor: designSystem.colors.warningSoft,
    borderWidth: 1,
    borderColor: designSystem.colors.warningBorder,
  },
  text: {
    flex: 1,
    color: designSystem.colors.warning,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    fontWeight: typography.weights.semiBold,
  },
  retryButton: {
    minHeight: 32,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: designSystem.radii.pill,
    backgroundColor: designSystem.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: designSystem.colors.warningBorder,
  },
  retryText: {
    color: designSystem.colors.warning,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
});
