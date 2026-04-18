import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { ROUTES } from "../navigation/routes";
import { Screen } from "../components/Screen";
import { colors, typography } from "../theme";
import { spacing } from "../constants/spacing";

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.Welcome>;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <Screen style={styles.container}>
      <View style={styles.content}>
        <View style={styles.mark}>
          <Text style={styles.markText}>U</Text>
        </View>

        <Text style={styles.title}>Comedor ULEAM</Text>
        <Text style={styles.subtitle}>
          Selecciona tu tipo de usuario para continuar
        </Text>

        <View style={styles.optionsRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate(ROUTES.StudentAccess)}
            style={({ pressed }) => [styles.optionCard, pressed && styles.optionPressed]}
          >
            <View style={styles.optionIcon}>
              <Text style={styles.optionIconText}>E</Text>
            </View>
            <Text style={styles.optionTitle}>Estudiante</Text>
            <Text style={styles.optionSubtitle}>Cuenta institucional</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate(ROUTES.Login)}
            style={({ pressed }) => [styles.optionCard, pressed && styles.optionPressed]}
          >
            <View style={[styles.optionIcon, styles.optionIconMuted]}>
              <Text style={styles.optionIconTextMuted}>C</Text>
            </View>
            <Text style={styles.optionTitle}>Comunidad</Text>
            <Text style={styles.optionSubtitle}>Personal y usuarios</Text>
          </Pressable>
        </View>

        <Text style={styles.footerNote}>
          Dirección de Bienestar Universitario • ULEAM
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  mark: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
    elevation: 2,
    marginBottom: spacing.lg,
  },
  markText: {
    color: colors.onPrimary,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeights.xl,
    textAlign: "center",
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.sm,
    textAlign: "center",
    marginTop: spacing.sm,
    maxWidth: 280,
  },
  optionsRow: {
    marginTop: spacing.xl,
    flexDirection: "row",
    gap: spacing.md,
  },
  optionCard: {
    width: 150,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 1,
  },
  optionPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.96,
    borderColor: colors.borderStrong,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  optionIconMuted: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionIconText: {
    color: colors.primary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  optionIconTextMuted: {
    color: colors.textMuted,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  optionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeights.md,
  },
  optionSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
  footerNote: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    lineHeight: typography.lineHeights.xs,
    marginTop: spacing.xl,
    textAlign: "center",
  },
});
