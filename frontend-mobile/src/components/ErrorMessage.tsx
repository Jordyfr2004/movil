import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { spacing } from "../constants/spacing";
import { colors, typography } from "../theme";
import { AppButton } from "./AppButton";
import { Card } from "./Card";

type ErrorMessageProps = {
  message: string;
  title?: string;
  onRetry?: () => void;
  retryLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function ErrorMessage({
  message,
  title,
  onRetry,
  retryLabel = "Reintentar",
  style,
}: ErrorMessageProps) {
  return (
    <Card variant="compact" style={[styles.card, style]}>
      <View style={styles.content}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={22}
          color={colors.error}
        />

        <View style={styles.textBlock}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          <Text style={styles.message}>{message}</Text>
        </View>

        {onRetry ? (
          <View style={styles.action}>
            <AppButton
              label={retryLabel}
              onPress={onRetry}
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
  card: {
    backgroundColor: colors.errorSoft,
    borderColor: colors.errorBorder,
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  content: {
    gap: spacing.sm,
  },
  textBlock: {
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.roles.cardTitle.fontSize,
    lineHeight: typography.roles.cardTitle.lineHeight,
    fontWeight: typography.roles.cardTitle.fontWeight,
    color: colors.error,
  },
  message: {
    fontSize: typography.roles.bodySmall.fontSize,
    lineHeight: typography.roles.bodySmall.lineHeight,
    color: colors.textSecondary,
  },
  action: {
    alignItems: "flex-start",
    marginTop: spacing.xs,
  },
});
