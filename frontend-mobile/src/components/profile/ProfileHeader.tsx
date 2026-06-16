import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { spacing } from "../../constants/spacing";
import { typography } from "../../theme";
import { studentPalette } from "../../theme/studentPalette";

export function ProfileHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <View style={styles.icon}>
          <MaterialCommunityIcons
            name="account-outline"
            size={20}
            color={studentPalette.primary}
          />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title} accessibilityRole="header">
            Cuenta estudiantil
          </Text>
          <Text style={styles.subtitle}>Datos básicos y acceso rápido.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.xs,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: studentPalette.card,
    borderWidth: 1,
    borderColor: studentPalette.border,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: typography.weights.bold,
    color: studentPalette.textPrimary,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: studentPalette.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
});
