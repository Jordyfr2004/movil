import React, { ReactNode } from "react";
import {
  StatusBar,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { designSystem } from "../theme";
import { spacing } from "../constants/spacing";
import { useAppPreferences } from "../context/AppPreferencesContext";
import { useThemeColors } from "../hooks/useThemeColors";

type ScreenProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  bottomInset?: number;
};

export function Screen({ children, style, bottomInset = 0 }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const theme = useThemeColors();
  const { resolvedScheme } = useAppPreferences();
  void bottomInset;

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={[
        styles.container,
        {
          paddingBottom: spacing.xl + Math.max(insets.bottom, 0),
          backgroundColor: theme.background,
        },
        style,
      ]}
    >
      <StatusBar
        barStyle={resolvedScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={theme.background}
      />
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: designSystem.spacing.screenHorizontal,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
});
