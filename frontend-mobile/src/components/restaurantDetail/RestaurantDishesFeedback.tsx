import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { spacing } from "../../constants/spacing";
import { studentPalette } from "../../theme/studentPalette";
import { EmptyState } from "../EmptyState";
import { ErrorMessage } from "../ErrorMessage";

type RestaurantDishesFeedbackProps = {
  variant: "loading" | "error" | "empty";
  error?: string | null;
  onRetry?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function RestaurantDishesFeedback({
  variant,
  error,
  onRetry,
  style,
}: RestaurantDishesFeedbackProps) {
  if (variant === "loading") {
    return (
      <View style={[styles.menuLoading, style]}>
        <View style={styles.skeletonCard}>
          <View style={styles.skeletonVisual} />
          <View style={styles.skeletonText}>
            <View style={styles.skeletonLineLg} />
            <View style={styles.skeletonLineSm} />
            <View style={styles.skeletonLineMd} />
          </View>
        </View>
        <View style={styles.skeletonCard}>
          <View style={styles.skeletonVisual} />
          <View style={styles.skeletonText}>
            <View style={styles.skeletonLineLg} />
            <View style={styles.skeletonLineSm} />
          </View>
        </View>
      </View>
    );
  }

  if (variant === "error") {
    return (
      <ErrorMessage
        title="No se pudieron cargar los platos"
        message={error ?? "No se pudieron cargar los platos"}
        onRetry={onRetry}
        style={[styles.feedbackCard, style]}
      />
    );
  }

  return (
    <EmptyState
      title="No hay platos disponibles"
      message="Vuelve más tarde para ver el menú."
      iconName="food-off-outline"
      style={[styles.feedbackCard, style]}
    />
  );
}

const styles = StyleSheet.create({
  menuLoading: {
    gap: spacing.sm,
  },
  skeletonCard: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: studentPalette.border,
    backgroundColor: studentPalette.card,
  },
  skeletonVisual: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: studentPalette.primaryPale,
  },
  skeletonText: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.sm,
  },
  skeletonLineLg: {
    height: 12,
    borderRadius: 10,
    backgroundColor: studentPalette.primarySoft,
    width: "70%",
  },
  skeletonLineMd: {
    height: 10,
    borderRadius: 10,
    backgroundColor: studentPalette.primaryPale,
    width: "55%",
  },
  skeletonLineSm: {
    height: 10,
    borderRadius: 10,
    backgroundColor: studentPalette.primaryPale,
    width: "42%",
  },
  feedbackCard: {
    borderRadius: 20,
    borderColor: studentPalette.border,
    backgroundColor: studentPalette.card,
  },
});
