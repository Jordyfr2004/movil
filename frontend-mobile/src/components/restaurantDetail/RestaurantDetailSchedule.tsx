import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { spacing } from "../../constants/spacing";
import { typography } from "../../theme";
import { studentPalette } from "../../theme/studentPalette";

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
    <View style={styles.metaItem}>
      <MaterialCommunityIcons
        name="clock-outline"
        size={17}
        color={studentPalette.textMuted}
      />
      <Text style={styles.metaValue}>
        {openingTime} - {closingTime}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  metaItem: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing.xs,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: studentPalette.border,
    backgroundColor: "rgba(255, 255, 255, 0.72)",
  },
  metaValue: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
    color: studentPalette.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
});
