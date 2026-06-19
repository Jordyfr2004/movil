import React from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Card } from "../Card";
import { StudentStatusPill } from "../StudentStatusPill";
import { StudentVisualPlaceholder } from "../StudentVisualPlaceholder";
import { Dish } from "../../services/dishService";
import { spacing } from "../../constants/spacing";
import { typography } from "../../theme";
import { managerPalette } from "./managerProfileTheme";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

type ManagerDishCardProps = {
  dish: Dish;
  isRemoving: boolean;
  isRemovingDisabled: boolean;
  isInteractionDisabled: boolean;
  onEdit: () => void;
  onRemove: () => void;
  onToggleHidden: (value: boolean) => void;
};

type DishActionProps = {
  iconName: IconName;
  label: string;
  tone?: "neutral" | "danger";
  disabled?: boolean;
  accessibilityLabel: string;
  onPress: () => void;
};

function DishAction({
  iconName,
  label,
  tone = "neutral",
  disabled,
  accessibilityLabel,
  onPress,
}: DishActionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionChip,
        tone === "danger" ? styles.actionChipDanger : styles.actionChipNeutral,
        pressed && !disabled && styles.actionPressed,
        disabled && styles.actionDisabled,
      ]}
    >
      <MaterialCommunityIcons
        name={iconName}
        size={15}
        color={tone === "danger" ? managerPalette.danger : managerPalette.info}
      />
      <Text
        style={[
          styles.actionText,
          tone === "danger" ? styles.actionTextDanger : styles.actionTextNeutral,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function ManagerDishCard({
  dish,
  isRemoving,
  isRemovingDisabled,
  isInteractionDisabled,
  onEdit,
  onRemove,
  onToggleHidden,
}: ManagerDishCardProps) {
  const isHidden = !dish.isAvailable;
  const statusLabel = dish.isAvailable ? "Visible" : "Oculto";

  return (
    <Card style={styles.card}>
      <View style={styles.contentRow}>
        <StudentVisualPlaceholder
          iconName="food-variant"
          label={`Plato ${dish.name}`}
          size="sm"
          style={styles.visual}
          variant="dish"
        />

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.dishName} numberOfLines={2}>
              {dish.name}
            </Text>
            <StudentStatusPill
              iconName={dish.isAvailable ? "eye-outline" : "eye-off-outline"}
              label={statusLabel}
              tone={dish.isAvailable ? "success" : "neutral"}
            />
          </View>

          {dish.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {dish.description}
            </Text>
          ) : null}

          <View style={styles.priceRow}>
            <MaterialCommunityIcons
              name="cash"
              size={16}
              color={managerPalette.primary}
            />
            <Text style={styles.price} numberOfLines={1}>
              ${dish.price}
            </Text>
          </View>

          <View style={styles.controlRow}>
            <View style={styles.visibilityControl}>
              <View style={styles.visibilityText}>
                <Text style={styles.visibilityLabel}>Ocultar</Text>
                <Text style={styles.visibilityValue}>
                  {isHidden ? "No visible" : "Visible"}
                </Text>
              </View>
              <Switch
                value={isHidden}
                onValueChange={onToggleHidden}
                disabled={isInteractionDisabled}
                accessibilityRole="switch"
                accessibilityLabel={`Ocultar plato ${dish.name}`}
                accessibilityState={{ disabled: isInteractionDisabled }}
                trackColor={{
                  false: managerPalette.neutralBorder,
                  true: managerPalette.primarySoft,
                }}
                thumbColor={
                  isHidden ? managerPalette.primary : managerPalette.card
                }
              />
            </View>

            <View style={styles.actionsRow}>
              <DishAction
                iconName="pencil-outline"
                label="Editar"
                accessibilityLabel={`Editar plato ${dish.name}`}
                onPress={onEdit}
              />
              <DishAction
                iconName="trash-can-outline"
                label={isRemoving ? "Eliminando..." : "Eliminar"}
                tone="danger"
                disabled={isRemovingDisabled}
                accessibilityLabel={`Eliminar plato ${dish.name}`}
                onPress={onRemove}
              />
            </View>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: 20,
    borderColor: managerPalette.border,
    backgroundColor: managerPalette.card,
    shadowColor: managerPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 1,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  visual: {
    width: 56,
    height: 58,
    borderRadius: 16,
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  dishName: {
    flex: 1,
    minWidth: 0,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: managerPalette.textPrimary,
    lineHeight: typography.lineHeights.md,
  },
  description: {
    fontSize: typography.sizes.sm,
    color: managerPalette.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
  priceRow: {
    alignSelf: "flex-start",
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: 999,
    backgroundColor: managerPalette.primaryPale,
    borderWidth: 1,
    borderColor: managerPalette.primarySoft,
  },
  price: {
    fontSize: typography.sizes.md,
    color: managerPalette.primary,
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.md,
  },
  controlRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: managerPalette.border,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  visibilityControl: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingLeft: spacing.sm,
    borderRadius: 16,
    backgroundColor: managerPalette.primaryFaint,
  },
  visibilityText: {
    gap: 0,
  },
  visibilityLabel: {
    fontSize: typography.sizes.xs,
    color: managerPalette.textMuted,
    fontWeight: typography.weights.semiBold,
    lineHeight: typography.lineHeights.xs,
  },
  visibilityValue: {
    fontSize: typography.sizes.xs,
    color: managerPalette.textPrimary,
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.xs,
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: spacing.xs,
  },
  actionChip: {
    minHeight: 34,
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  actionChipNeutral: {
    backgroundColor: managerPalette.infoSoft,
    borderColor: managerPalette.infoBorder,
  },
  actionChipDanger: {
    backgroundColor: managerPalette.dangerSoft,
    borderColor: managerPalette.dangerBorder,
  },
  actionPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  actionDisabled: {
    opacity: 0.5,
  },
  actionText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.xs,
  },
  actionTextNeutral: {
    color: managerPalette.info,
  },
  actionTextDanger: {
    color: managerPalette.danger,
  },
});
