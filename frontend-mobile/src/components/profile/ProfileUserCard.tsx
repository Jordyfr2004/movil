import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { spacing } from "../../constants/spacing";
import { colors, typography } from "../../theme";
import { Card } from "../Card";
import { StatusBadge } from "../StatusBadge";

type ProfileUserCardProps = {
  displayEmail: string;
  displayName: string;
  initial: string;
  roleLabel: string;
};

export function ProfileUserCard({
  displayEmail,
  displayName,
  initial,
  roleLabel,
}: ProfileUserCardProps) {
  const accessibilityLabel = displayEmail
    ? `Perfil de ${displayName}. Correo ${displayEmail}. Rol ${roleLabel}.`
    : `Perfil de ${displayName}. Rol ${roleLabel}.`;

  return (
    <Card accessible accessibilityLabel={accessibilityLabel}>
      <View style={styles.profileRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.profileText}>
          <Text style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.email} numberOfLines={1}>
            {displayEmail}
          </Text>
        </View>
        <StatusBadge label={roleLabel} tone="success" />
      </View>

      <View style={styles.divider} />

      <View style={styles.field}>
        <Text style={styles.label}>Rol</Text>
        <Text style={styles.value}>{roleLabel}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  profileText: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeights.md,
  },
  email: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  value: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    fontWeight: typography.weights.semiBold,
  },
});
