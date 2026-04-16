import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, typography } from "../theme";
import { spacing } from "../constants/spacing";

type StatusBadgeProps = {
  label: string;
  tone: "success" | "danger";
};

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        tone === "success" ? styles.success : styles.danger,
      ]}
    >
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  success: {
    backgroundColor: colors.successSoft,
  },
  danger: {
    backgroundColor: colors.errorSoft,
  },
  text: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
  },
});
