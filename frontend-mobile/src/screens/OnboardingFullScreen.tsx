import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppButton } from "../components";
import { spacing } from "../constants/spacing";
import { useReduceMotion } from "../hooks/useReduceMotion";
import { ROUTES } from "../navigation/routes";
import { StudentStackParamList } from "../navigation/types";
import { designSystem, typography } from "../theme";
import { studentPalette } from "../theme/studentPalette";
import { ONBOARDING_STAGE_DETAILS } from "./OnboardingStageDetailScreen";

type Props = NativeStackScreenProps<
  StudentStackParamList,
  typeof ROUTES.OnboardingFull
>;

export function OnboardingFullScreen({ navigation }: Props) {
  const [page, setPage] = useState(0);
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();
  const opacity = useRef(new Animated.Value(1)).current;
  const current = ONBOARDING_STAGE_DETAILS[page];
  const isLast = page === ONBOARDING_STAGE_DETAILS.length - 1;

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1);
      return;
    }
    opacity.setValue(0);
    Animated.timing(opacity, {
      toValue: 1,
      duration: designSystem.animation.normal,
      useNativeDriver: true,
    }).start();
  }, [opacity, page, reduceMotion]);

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + spacing.md,
          paddingBottom: insets.bottom + spacing.lg,
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Omitir onboarding"
        onPress={() => navigation.goBack()}
        style={styles.skipButton}
      >
        <Text style={styles.skipText}>Omitir</Text>
      </Pressable>

      <Animated.View style={[styles.content, { opacity }]}>
        <View style={styles.visual}>
          <View style={styles.orbitOne} />
          <View style={styles.orbitTwo} />
          <View style={styles.icon}>
            <MaterialCommunityIcons
              name={current.icon}
              size={48}
              color={designSystem.colors.primary}
            />
          </View>
        </View>
        <Text style={styles.stepText}>
          {page + 1} de {ONBOARDING_STAGE_DETAILS.length}
        </Text>
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.message}>{current.message}</Text>
      </Animated.View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {ONBOARDING_STAGE_DETAILS.map((item, index) => (
            <View
              key={item.title}
              style={[styles.dot, index === page && styles.dotActive]}
            />
          ))}
        </View>
        <AppButton
          label={isLast ? "Comenzar" : "Siguiente"}
          onPress={() => {
            if (isLast) {
              navigation.goBack();
              return;
            }
            setPage((value) => value + 1);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    backgroundColor: studentPalette.background,
  },
  skipButton: {
    alignSelf: "flex-end",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  skipText: {
    color: designSystem.colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  content: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: spacing.xl,
  },
  visual: {
    width: 180,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  orbitOne: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 999,
    backgroundColor: designSystem.colors.primaryFaint,
  },
  orbitTwo: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 999,
    backgroundColor: designSystem.colors.secondarySoft,
  },
  icon: {
    width: 92,
    height: 92,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: designSystem.colors.surface,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
    ...designSystem.shadows.sm,
  },
  stepText: {
    color: designSystem.colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  title: {
    marginTop: spacing.sm,
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.xxl,
    lineHeight: typography.lineHeights.xxl,
    fontWeight: typography.weights.bold,
    textAlign: "center",
  },
  message: {
    marginTop: spacing.md,
    color: designSystem.colors.textSecondary,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    textAlign: "center",
  },
  footer: { gap: spacing.lg },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: designSystem.colors.borderStrong,
  },
  dotActive: {
    width: 24,
    backgroundColor: designSystem.colors.primary,
  },
});
