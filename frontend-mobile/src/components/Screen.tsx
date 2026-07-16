import React, { ReactNode } from "react";
import {
  StatusBar,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme";
import { spacing } from "../constants/spacing";

type ScreenProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  bottomInset?: number;
};

export function Screen({ children, style, bottomInset = 0 }: ScreenProps) {
  const insets = useSafeAreaInsets();
  void bottomInset;

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={[
        styles.container,
        {
          paddingBottom: spacing.lg + Math.max(insets.bottom, 0),
        },
        style,
      ]}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
});
