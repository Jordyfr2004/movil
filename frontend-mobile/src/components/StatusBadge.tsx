import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, typography } from "../theme";
import { spacing } from "../constants/spacing";

type StatusBadgeProps = {
  label: string;
  tone: "success" | "danger";
};

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  const isSuccess = tone === "success";

  return (
    <View
      style={[
        styles.badge,
        isSuccess ? styles.success : styles.danger,
        isSuccess ? styles.successBorder : styles.dangerBorder,
      ]}
    >
      <Text style={[styles.text, isSuccess ? styles.textSuccess : styles.textDanger]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  success: {
    backgroundColor: colors.successSoft,
  },
  danger: {
    backgroundColor: colors.errorSoft,
  },
  successBorder: {
    borderWidth: 1,
    borderColor: "rgba(46, 125, 79, 0.20)",
  },
  dangerBorder: {
    borderWidth: 1,
    borderColor: "rgba(214, 69, 80, 0.20)",
  },
  text: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
  },
  textSuccess: {
    color: colors.success,
  },
  textDanger: {
    color: colors.error,
  },
});
