import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AppButton, Screen } from "../components";
import { spacing } from "../constants/spacing";
import { ROUTES } from "../navigation/routes";
import { StudentStackParamList } from "../navigation/types";
import { designSystem, typography } from "../theme";
import { studentPalette } from "../theme/studentPalette";
import {
  ONBOARDING_STAGE_DETAILS,
  OnboardingStageCard,
} from "./OnboardingStageDetailScreen";

type Props = NativeStackScreenProps<
  StudentStackParamList,
  typeof ROUTES.OnboardingReview
>;

export function OnboardingReviewScreen({ navigation }: Props) {
  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Onboarding</Text>
        <Text style={styles.subtitle}>Revisa las funciones principales de la app.</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {ONBOARDING_STAGE_DETAILS.map((item, index) => (
          <OnboardingStageCard
            key={item.title}
            icon={item.icon}
            index={index}
            title={item.title}
            message={item.message}
            onPress={() =>
              navigation.navigate(ROUTES.OnboardingStageDetail, { index })
            }
          />
        ))}
        <AppButton
          label="Ver onboarding completo"
          onPress={() => navigation.navigate(ROUTES.OnboardingFull)}
          style={styles.fullButton}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: studentPalette.background },
  header: { gap: spacing.xs, marginBottom: spacing.md },
  title: {
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    color: designSystem.colors.textSecondary,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
  },
  scroll: { flex: 1, backgroundColor: "transparent" },
  content: { gap: spacing.sm, paddingBottom: spacing.xxxl },
  fullButton: { marginTop: spacing.md },
});
