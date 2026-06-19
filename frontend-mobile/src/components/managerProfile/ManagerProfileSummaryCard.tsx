import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { AppButton } from "../AppButton";
import { Card } from "../Card";
import { StudentStatusPill } from "../StudentStatusPill";
import { StudentVisualPlaceholder } from "../StudentVisualPlaceholder";
import { spacing } from "../../constants/spacing";
import { typography } from "../../theme";
import {
  MANAGER_AVATAR_RADIUS,
  MANAGER_AVATAR_SIZE,
  MANAGER_ROLE_LABEL,
  managerPalette,
} from "./managerProfileTheme";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

type ManagerProfileSummaryCardProps = {
  displayName: string;
  displayEmail: string;
  initial: string;
  restaurantName: string;
  dishesCount: number;
  isLoggingOut: boolean;
  onAddDishPress: () => void;
  onLogoutPress: () => void;
};

type SummaryMetricProps = {
  iconName: IconName;
  label: string;
  value: string;
};

function SummaryMetric({ iconName, label, value }: SummaryMetricProps) {
  return (
    <View style={styles.metric}>
      <View style={styles.metricIcon}>
        <MaterialCommunityIcons
          name={iconName}
          size={17}
          color={managerPalette.primary}
        />
      </View>
      <View style={styles.metricText}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricValue} numberOfLines={2}>
          {value}
        </Text>
      </View>
    </View>
  );
}

export function ManagerProfileSummaryCard({
  displayName,
  displayEmail,
  initial,
  restaurantName,
  dishesCount,
  isLoggingOut,
  onAddDishPress,
  onLogoutPress,
}: ManagerProfileSummaryCardProps) {
  const dishesLabel = `${dishesCount} plato${dishesCount === 1 ? "" : "s"}`;

  return (
    <Card style={styles.card}>
      <View style={styles.profileRow}>
        <StudentVisualPlaceholder
          initial={initial}
          label={`Encargado ${displayName}`}
          size="sm"
          style={styles.avatar}
          variant="profile"
        />

        <View style={styles.profileText}>
          <Text style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.email} numberOfLines={1}>
            {displayEmail || "-"}
          </Text>
        </View>

        <StudentStatusPill
          iconName="shield-account-outline"
          label={MANAGER_ROLE_LABEL}
          tone="primary"
        />
      </View>

      <View style={styles.metricsGrid}>
        <SummaryMetric
          iconName="storefront-outline"
          label="Restaurante"
          value={restaurantName || "-"}
        />
        <SummaryMetric
          iconName="food-variant"
          label="Carta"
          value={dishesLabel}
        />
      </View>

      <View style={styles.actions}>
        <AppButton
          label="Añadir platos"
          accessibilityLabel="Añadir platos al restaurante"
          accessibilityHint="Abre el formulario para crear un nuevo plato."
          onPress={onAddDishPress}
          style={styles.primaryAction}
        />

        <View style={styles.secondaryActions}>
          <AppButton
            label={isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
            accessibilityLabel={
              isLoggingOut ? "Cerrando sesión" : "Cerrar sesión"
            }
            accessibilityHint="Cierra tu sesión de encargado."
            onPress={onLogoutPress}
            variant="danger"
            size="sm"
            disabled={isLoggingOut}
            style={styles.logoutButton}
          />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: 22,
    borderColor: managerPalette.border,
    backgroundColor: managerPalette.card,
    shadowColor: managerPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  avatar: {
    width: MANAGER_AVATAR_SIZE,
    height: MANAGER_AVATAR_SIZE,
    borderRadius: MANAGER_AVATAR_RADIUS,
  },
  profileText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  name: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: managerPalette.textPrimary,
    lineHeight: typography.lineHeights.md,
  },
  email: {
    fontSize: typography.sizes.sm,
    color: managerPalette.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
  metricsGrid: {
    marginTop: spacing.lg,
    flexDirection: "row",
    gap: spacing.sm,
  },
  metric: {
    flex: 1,
    minWidth: 0,
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: managerPalette.border,
    backgroundColor: managerPalette.primaryFaint,
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: managerPalette.card,
    borderWidth: 1,
    borderColor: managerPalette.primarySoft,
  },
  metricText: {
    gap: 2,
  },
  metricLabel: {
    fontSize: typography.sizes.xs,
    color: managerPalette.textMuted,
    fontWeight: typography.weights.semiBold,
    lineHeight: typography.lineHeights.xs,
  },
  metricValue: {
    fontSize: typography.sizes.sm,
    color: managerPalette.textPrimary,
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.sm,
  },
  actions: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  primaryAction: {
    borderRadius: 16,
  },
  secondaryActions: {
    alignItems: "flex-start",
  },
  logoutButton: {
    paddingHorizontal: spacing.lg,
  },
});
