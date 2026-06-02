import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../AppButton";
import { Card } from "../Card";
import { StatusBadge } from "../StatusBadge";
import { spacing } from "../../constants/spacing";
import { colors, typography } from "../../theme";
import {
  MANAGER_AVATAR_RADIUS,
  MANAGER_AVATAR_SIZE,
  MANAGER_ROLE_LABEL,
} from "./managerProfileTheme";

type ManagerProfileSummaryCardProps = {
  displayName: string;
  displayEmail: string;
  initial: string;
  restaurantName: string;
  isLoggingOut: boolean;
  onAddDishPress: () => void;
  onLogoutPress: () => void;
};

export function ManagerProfileSummaryCard({
  displayName,
  displayEmail,
  initial,
  restaurantName,
  isLoggingOut,
  onAddDishPress,
  onLogoutPress,
}: ManagerProfileSummaryCardProps) {
  return (
    <Card>
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

        <StatusBadge label={MANAGER_ROLE_LABEL} tone="success" />
      </View>

      <View style={styles.divider} />

      <View style={styles.field}>
        <Text style={styles.label}>Restaurante</Text>
        <Text style={styles.value} numberOfLines={2}>
          {restaurantName || "-"}
        </Text>
      </View>

      <View style={styles.actions}>
        <AppButton
          label="Añadir platos"
          accessibilityLabel="Añadir platos al restaurante"
          onPress={onAddDishPress}
        />

        <AppButton
          label={isLoggingOut ? "Cerrando sesión…" : "Cerrar sesión"}
          accessibilityLabel={isLoggingOut ? "Cerrando sesión" : "Cerrar sesión"}
          onPress={onLogoutPress}
          variant="danger"
          disabled={isLoggingOut}
        />
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
    width: MANAGER_AVATAR_SIZE,
    height: MANAGER_AVATAR_SIZE,
    borderRadius: MANAGER_AVATAR_RADIUS,
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
  actions: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
});
