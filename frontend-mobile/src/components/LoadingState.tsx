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
import { typography } from "../theme";
import { useThemeColors } from "../hooks/useThemeColors";
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
  const theme = useThemeColors();

  return (
    <Card variant="compact" style={style}>
      <View style={styles.content}>
        <ActivityIndicator size={size} color={theme.primary} />
        <Text style={[styles.message, { color: theme.textSecondary }]}>
          {message}
        </Text>
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
    fontSize: typography.roles.bodySmall.fontSize,
    lineHeight: typography.roles.bodySmall.lineHeight,
  },
});
