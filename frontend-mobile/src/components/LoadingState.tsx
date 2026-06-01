import React from "react";
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import { spacing } from "../constants/spacing";
import { colors, typography } from "../theme";
import { Card } from "./Card";

type LoadingStateProps = {
  message: string;
  size?: React.ComponentProps<typeof ActivityIndicator>["size"];
  style?: StyleProp<ViewStyle>;
};

export function LoadingState({
  message,
  size = "small",
  style,
}: LoadingStateProps) {
  return (
    <Card variant="muted" style={style}>
      <View style={styles.content}>
        <ActivityIndicator size={size} color={colors.primary} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  message: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
});
