import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Card } from "../Card";
import { StudentStatusPill } from "../StudentStatusPill";
import { spacing } from "../../constants/spacing";
import { typography } from "../../theme";
import { MANAGER_ROLE_LABEL, managerPalette } from "./managerProfileTheme";

type ManagerProfileSummaryCardProps = {
  displayName: string;
  displayEmail: string;
  initial: string;
  restaurantName: string;
  dishesCount: number;
  visibleDishesCount: number;
};

type MetricProps = {
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  value: string;
};

function Metric({ iconName, label, value }: MetricProps) {
  return (
    <View style={styles.metric}>
      <View style={styles.metricIcon}>
        <MaterialCommunityIcons
          name={iconName}
          size={18}
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
  visibleDishesCount,
}: ManagerProfileSummaryCardProps) {
  const dishesLabel = `${dishesCount} plato${dishesCount === 1 ? "" : "s"}`;
  const visibleLabel = `${visibleDishesCount} visible${
    visibleDishesCount === 1 ? "" : "s"
  }`;

  return (
    <Card style={styles.card}>
      <View style={styles.profileRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>{initial}</Text>
        </View>

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
          size="md"
        />
      </View>

      <View style={styles.metricsGrid}>
        <Metric
          iconName="storefront-outline"
          label="Restaurante"
          value={restaurantName || "Sin restaurante"}
        />
        <Metric iconName="food-variant" label="Carta" value={dishesLabel} />
        <Metric iconName="eye-outline" label="Visibles" value={visibleLabel} />
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
    width: 64,
    height: 64,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: managerPalette.primaryPale,
    borderWidth: 1,
    borderColor: managerPalette.primarySoft,
  },
  avatarInitial: {
    fontSize: 26,
    fontWeight: typography.weights.bold,
    color: managerPalette.primary,
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
    marginTop: spacing.md,
    flexDirection: "row",
    gap: spacing.sm,
  },
  metric: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: managerPalette.border,
    backgroundColor: managerPalette.cardMuted,
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
});
