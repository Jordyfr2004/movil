import React, { ReactNode } from "react";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from "react-native";
import { colors } from "../theme";
import { spacing } from "../constants/spacing";

type ScreenProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Screen({ children, style }: ScreenProps) {
  return (
    <SafeAreaView style={[styles.container, style]}>
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
    paddingBottom: spacing.lg,
  },
});
