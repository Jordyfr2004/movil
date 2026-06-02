import React from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { colors } from "../../theme";
import { StudentAccessLayoutMetrics } from "./studentAccessTheme";
import { useStudentAccessEntranceAnimation } from "./useStudentAccessEntranceAnimation";

type StudentAccessFooterProps = {
  metrics: StudentAccessLayoutMetrics;
};

export function StudentAccessFooter({ metrics }: StudentAccessFooterProps) {
  const footerEntrance = useStudentAccessEntranceAnimation(300);

  return (
    <Animated.Text
      style={[
        styles.footerNote,
        footerEntrance,
        {
          paddingTop: metrics.footerPaddingTop,
          paddingHorizontal: metrics.footerPaddingHorizontal,
          paddingBottom: metrics.footerPaddingBottom,
          fontSize: metrics.footerFontSize,
          lineHeight: metrics.footerLineHeight,
        },
      ]}
    >
      Universidad Laica Eloy Alfaro de Manabí
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  footerNote: {
    width: "100%",
    alignSelf: "center",
    textAlign: "center",
    color: colors.textMuted,
    opacity: 0.9,
  },
});
