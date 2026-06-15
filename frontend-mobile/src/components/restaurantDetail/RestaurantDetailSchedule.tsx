import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { spacing } from "../../constants/spacing";
import { typography } from "../../theme";
import { studentPalette } from "../../theme/studentPalette";
import { Card } from "../Card";

type RestaurantDetailScheduleProps = {
  openingTime?: string;
  closingTime?: string;
};

export function RestaurantDetailSchedule({
  openingTime,
  closingTime,
}: RestaurantDetailScheduleProps) {
  if (!openingTime || !closingTime) {
    return null;
  }

  return (
    <Card style={styles.metaItem}>
      <View style={styles.icon}>
        <MaterialCommunityIcons
          name="clock-outline"
          size={18}
          color={studentPalette.primary}
        />
      </View>
      <View style={styles.metaText}>
        <Text style={styles.metaLabel}>Horario</Text>
        <Text style={styles.metaValue}>
          {openingTime} - {closingTime}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: 18,
    padding: spacing.md,
    borderColor: studentPalette.border,
    backgroundColor: studentPalette.card,
    shadowOpacity: 0,
    elevation: 0,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: studentPalette.primaryPale,
  },
  metaText: {
    flex: 1,
    minWidth: 0,
  },
  metaLabel: {
    fontSize: typography.sizes.xs,
    color: studentPalette.textMuted,
  },
  metaValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semiBold,
    color: studentPalette.textPrimary,
  },
});
