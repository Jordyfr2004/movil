import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { spacing } from "../constants/spacing";
import { colors, typography } from "../theme";
import { AppButton } from "./AppButton";
import { Card } from "./Card";

type EmptyStateProps = {
  title: string;
  message: string;
  iconName?: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  actionLabel?: string;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function EmptyState({
  title,
  message,
  iconName,
  actionLabel,
  onActionPress,
  style,
}: EmptyStateProps) {
  return (
    <Card variant="muted" style={style}>
      <View style={styles.content}>
        {iconName ? (
          <MaterialCommunityIcons
            name={iconName}
            size={22}
            color={colors.textMuted}
          />
        ) : null}

        <View style={styles.textBlock}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
        </View>

        {actionLabel && onActionPress ? (
          <View style={styles.action}>
            <AppButton
              label={actionLabel}
              onPress={onActionPress}
              size="sm"
              variant="secondary"
            />
          </View>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.sm,
  },
  textBlock: {
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  message: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
  action: {
    alignItems: "flex-start",
    marginTop: spacing.xs,
  },
});
