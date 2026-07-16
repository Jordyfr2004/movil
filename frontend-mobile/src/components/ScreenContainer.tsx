import React, { ReactNode } from "react";
import {
  StatusBar,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { spacing } from "../constants/spacing";
import { designSystem } from "../theme";
import { useAppPreferences } from "../context/AppPreferencesContext";
import { useThemeColors } from "../hooks/useThemeColors";

type ScreenContainerProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  withHorizontalPadding?: boolean;
  bottomInset?: number;
};

export function ScreenContainer({
  children,
  style,
  contentStyle,
  withHorizontalPadding = true,
  bottomInset = 0,
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();
  const theme = useThemeColors();
  const { resolvedScheme } = useAppPreferences();
  void bottomInset;

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={[styles.safeArea, { backgroundColor: theme.background }, style]}
    >
      <StatusBar
        barStyle={resolvedScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={theme.background}
      />
      <View
        style={[
          styles.content,
          withHorizontalPadding && styles.horizontalPadding,
          {
            paddingBottom: spacing.xl + Math.max(insets.bottom, 0),
          },
          contentStyle,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: spacing.md,
    backgroundColor: "transparent",
  },
  horizontalPadding: {
    paddingHorizontal: designSystem.spacing.screenHorizontal,
  },
});
