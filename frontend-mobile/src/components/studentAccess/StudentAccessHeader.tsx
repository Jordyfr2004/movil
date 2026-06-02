import React from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { spacing } from "../../constants/spacing";
import { colors, typography } from "../../theme";
import { StudentAccessLayoutMetrics } from "./studentAccessTheme";
import { useStudentAccessEntranceAnimation } from "./useStudentAccessEntranceAnimation";

type StudentAccessHeaderProps = {
  metrics: StudentAccessLayoutMetrics;
};

export function StudentAccessHeader({ metrics }: StudentAccessHeaderProps) {
  const logoEntrance = useStudentAccessEntranceAnimation(40);
  const textEntrance = useStudentAccessEntranceAnimation(130);

  return (
    <>
      <Animated.View style={logoEntrance}>
        <View
          style={[
            styles.isotype,
            {
              width: metrics.isotypeSize,
              height: metrics.isotypeSize,
              borderRadius: metrics.isotypeRadius,
            },
          ]}
        >
          <Text
            style={[
              styles.isotypeText,
              {
                fontSize: metrics.isotypeTextSize,
              },
            ]}
          >
            U
          </Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.textBlock, textEntrance]}>
        <Text
          style={[
            styles.title,
            {
              marginTop: metrics.titleMarginTop,
              fontSize: metrics.titleSize,
              lineHeight: metrics.titleLineHeight,
            },
          ]}
        >
          Comedor ULEAM
        </Text>

        <Text style={styles.subtitle}>Acceso institucional</Text>

        <Text
          style={[
            styles.supporting,
            {
              maxWidth: metrics.supportingMaxWidth,
            },
          ]}
        >
          Usa tu cuenta para continuar
        </Text>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  textBlock: {
    width: "100%",
    alignItems: "center",
  },
  isotype: {
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.68)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2E2018",
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  isotypeText: {
    color: colors.onPrimary,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.8,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: typography.weights.bold,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semiBold,
    lineHeight: typography.lineHeights.md,
    textAlign: "center",
  },
  supporting: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    textAlign: "center",
  },
});
