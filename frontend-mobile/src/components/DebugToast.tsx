import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { spacing } from "../constants/spacing";
import { colors, typography } from "../theme";

type DebugToastProps = {
  visible: boolean;
  title: string;
  message?: string;
  onClose?: () => void;
};

export function DebugToast({ visible, title, message, onClose }: DebugToastProps) {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.root,
        { top: Math.max(insets.top, 0) + spacing.md },
      ]}
    >
      <View style={styles.card}>
        <View style={styles.accent} />

        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          {message ? (
            <Text style={styles.message} numberOfLines={4}>
              {message}
            </Text>
          ) : null}
        </View>

        {onClose ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
            hitSlop={12}
            onPress={onClose}
            style={styles.close}
          >
            <Text style={styles.closeText}>×</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 999,
  },
  card: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: spacing.lg,
  },
  accent: {
    width: 4,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignSelf: "stretch",
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
  },
  message: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
  close: {
    marginLeft: spacing.xs,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    fontSize: 22,
    lineHeight: 22,
    color: colors.textMuted,
    fontWeight: typography.weights.semiBold,
  },
});