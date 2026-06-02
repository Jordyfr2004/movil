import React from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { AppButton } from "../AppButton";
import { Card } from "../Card";
import { StatusBadge } from "../StatusBadge";
import { Dish } from "../../services/dishService";
import { spacing } from "../../constants/spacing";
import { colors, typography } from "../../theme";

type ManagerDishCardProps = {
  dish: Dish;
  isRemoving: boolean;
  isRemovingDisabled: boolean;
  isInteractionDisabled: boolean;
  onEdit: () => void;
  onRemove: () => void;
  onToggleHidden: (value: boolean) => void;
};

export function ManagerDishCard({
  dish,
  isRemoving,
  isRemovingDisabled,
  isInteractionDisabled,
  onEdit,
  onRemove,
  onToggleHidden,
}: ManagerDishCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.dishRow}>
        <View style={styles.dishText}>
          <Text style={styles.dishName} numberOfLines={1}>
            {dish.name}
          </Text>
          {dish.description ? (
            <Text style={styles.dishDescription} numberOfLines={2}>
              {dish.description}
            </Text>
          ) : null}
          <Text style={styles.dishMeta} numberOfLines={1}>
            ${dish.price}
          </Text>
        </View>

        <View style={styles.dishActions}>
          <View style={styles.dishToggleRow}>
            <StatusBadge
              label={dish.isAvailable ? "Visible" : "Oculto"}
              tone={dish.isAvailable ? "success" : "danger"}
            />

            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>Ocultar</Text>
              <Switch
                value={!dish.isAvailable}
                onValueChange={onToggleHidden}
                disabled={isInteractionDisabled}
                accessibilityRole="switch"
                accessibilityLabel={`Ocultar plato ${dish.name}`}
              />
            </View>
          </View>

          <AppButton
            label="Editar"
            accessibilityLabel={`Editar plato ${dish.name}`}
            size="sm"
            variant="secondary"
            onPress={onEdit}
          />

          <AppButton
            label={isRemoving ? "Eliminando…" : "Eliminar"}
            accessibilityLabel={`Eliminar plato ${dish.name}`}
            size="sm"
            variant="danger"
            disabled={isRemovingDisabled}
            onPress={onRemove}
          />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 0,
  },
  dishRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dishText: {
    flex: 1,
    gap: 2,
  },
  dishName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
  },
  dishMeta: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  dishDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
  dishActions: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  dishToggleRow: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  toggleLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
});
