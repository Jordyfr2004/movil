import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { spacing } from "../constants/spacing";
import { typography } from "../theme";
import { studentPalette } from "../theme/studentPalette";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

type StudentSectionHeaderProps = {
  title: string;
  subtitle?: string;
  count?: number | string;
  iconName?: IconName;
  style?: StyleProp<ViewStyle>;
};

export function StudentSectionHeader({
  title,
  subtitle,
  count,
  iconName,
  style,
}: StudentSectionHeaderProps) {
  return (
    <View style={[styles.header, style]}>
      <View style={styles.left}>
        {iconName ? (
          <View style={styles.icon}>
            <MaterialCommunityIcons
              name={iconName}
              size={20}
              color={studentPalette.primary}
            />
          </View>
        ) : null}
        <View style={styles.textGroup}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>

      {count !== undefined ? (
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{count}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  left: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: studentPalette.primaryPale,
    borderWidth: 1,
    borderColor: studentPalette.border,
  },
  textGroup: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: typography.weights.bold,
    color: studentPalette.textPrimary,
    lineHeight: 24,
  },
  subtitle: {
    marginTop: 1,
    fontSize: typography.sizes.xs,
    color: studentPalette.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
  countBadge: {
    minWidth: 30,
    minHeight: 30,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    backgroundColor: studentPalette.primaryPale,
    borderWidth: 1,
    borderColor: studentPalette.primarySoft,
  },
  countText: {
    fontSize: typography.sizes.xs,
    color: studentPalette.primary,
    fontWeight: typography.weights.bold,
  },
});
