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
        <View style={styles.skeletonLineLg} />
        <View style={styles.skeletonLineSm} />
        <View style={styles.skeletonLineLg} />
      </View>
    );
  }

  if (variant === "error") {
    return (
      <ErrorMessage
        title="No se pudieron cargar los platos"
        message={error ?? "No se pudieron cargar los platos"}
        onRetry={onRetry}
        style={style}
      />
    );
  }

  return (
    <EmptyState
      title="No hay platos disponibles"
      message="Vuelve más tarde para ver el menú."
      iconName="food-off-outline"
      style={style}
    />
  );
}

const styles = StyleSheet.create({
  menuLoading: {
    gap: spacing.sm,
  },
  skeletonLineLg: {
    height: 14,
    borderRadius: 10,
    backgroundColor: studentPalette.primarySoft,
    width: "70%",
  },
  skeletonLineSm: {
    height: 12,
    borderRadius: 10,
    backgroundColor: studentPalette.primarySoft,
    width: "45%",
  },
});
