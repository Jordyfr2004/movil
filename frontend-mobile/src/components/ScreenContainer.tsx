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
  void bottomInset;

  return (
    <SafeAreaView edges={["top", "bottom"]} style={[styles.safeArea, style]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={designSystem.colors.background}
      />
      <View
        style={[
          styles.content,
          withHorizontalPadding && styles.horizontalPadding,
          {
            paddingBottom: spacing.lg + Math.max(insets.bottom, 0),
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
    backgroundColor: designSystem.colors.background,
  },
  content: {
    flex: 1,
    paddingTop: spacing.sm,
    backgroundColor: "transparent",
  },
  horizontalPadding: {
    paddingHorizontal: spacing.lg,
  },
});
