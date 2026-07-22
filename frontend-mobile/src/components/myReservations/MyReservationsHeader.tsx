import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { spacing } from "../../constants/spacing";
import { typography } from "../../theme";
import { studentPalette } from "../../theme/studentPalette";

type MyReservationsHeaderProps = {
  hasError: boolean;
  loading: boolean;
};

export function MyReservationsHeader({
  hasError,
  loading,
}: MyReservationsHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <View style={styles.icon}>
          <MaterialCommunityIcons
            name="calendar-check-outline"
            size={18}
            color={studentPalette.primary}
          />
        </View>
        <Text style={styles.title} numberOfLines={1}>Mis reservas</Text>
      </View>
      <Text style={styles.subtitle}>
        {loading || hasError
          ? "Actualizando tus pedidos."
          : "Gestiona tus pedidos e historial."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 1,
    paddingBottom: 4,
    gap: 1,
  },
  titleRow: {
    minHeight: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: studentPalette.primaryFaint,
    borderWidth: 1,
    borderColor: studentPalette.primarySoft,
  },
  title: {
    flex: 1,
    color: studentPalette.textPrimary,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    color: studentPalette.textSecondary,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: typography.weights.semiBold,
  },
});
