import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { spacing } from "../../constants/spacing";
import { typography } from "../../theme";
import { studentPalette } from "../../theme/studentPalette";

type RestaurantReserveButtonProps = {
  dishName: string;
  disabled: boolean;
  isReserved: boolean;
  isReserving: boolean;
  onPress: () => void;
};

export function RestaurantReserveButton({
  dishName,
  disabled,
  isReserved,
  isReserving,
  onPress,
}: RestaurantReserveButtonProps) {
  const label = isReserving
    ? "Reservando..."
    : isReserved
      ? "Ya reservaste"
      : "Reservar";

  const accessibilityLabel = isReserving
    ? `Reservando ${dishName}`
    : isReserved
      ? `Reserva registrada para ${dishName}`
      : `Reservar ${dishName}`;

  const accessibilityHint = isReserved
    ? "Este plato ya tiene una reserva activa."
    : "Crea una reserva para este plato.";

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isReserved ? styles.reservedButton : styles.primaryButton,
        pressed && !disabled && styles.pressed,
        disabled && !isReserved && styles.disabled,
      ]}
    >
      <View style={styles.content}>
        {isReserving ? (
          <ActivityIndicator size="small" color={studentPalette.card} />
        ) : isReserved ? (
          <MaterialCommunityIcons
            name="check-circle-outline"
            size={16}
            color={studentPalette.neutral}
          />
        ) : null}
        <Text
          style={[
            styles.label,
            isReserved ? styles.reservedLabel : styles.primaryLabel,
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 92,
    minHeight: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  primaryButton: {
    backgroundColor: studentPalette.primary,
    shadowColor: studentPalette.primary,
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  reservedButton: {
    minWidth: 112,
    backgroundColor: studentPalette.neutralSoft,
    borderWidth: 1,
    borderColor: studentPalette.neutralBorder,
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.97 }],
  },
  disabled: {
    opacity: 0.55,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.sm,
  },
  primaryLabel: {
    color: studentPalette.card,
  },
  reservedLabel: {
    color: studentPalette.neutral,
  },
});
