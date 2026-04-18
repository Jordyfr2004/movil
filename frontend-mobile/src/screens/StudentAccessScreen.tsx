import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { ROUTES } from "../navigation/routes";
import { Screen } from "../components/Screen";
import { colors, typography } from "../theme";
import { spacing } from "../constants/spacing";

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.StudentAccess>;

export function StudentAccessScreen({ navigation }: Props) {
  return (
    <Screen style={styles.container}>
      <View style={styles.content}>
        <View style={styles.brandBlock}>
          <View style={styles.mark}>
            <Text style={styles.markText}>U</Text>
          </View>
          <Text style={styles.title}>Comedor ULEAM</Text>
          <Text style={styles.subtitle}>Acceso institucional</Text>
          <Text style={styles.supporting}>Usa tu cuenta para continuar</Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={() => navigation.navigate(ROUTES.Login)}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.buttonBase,
              styles.microsoftButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <View style={styles.microsoftIcon}>
              <View style={styles.microsoftGrid}>
                <View style={styles.microsoftSquare} />
                <View style={styles.microsoftSquare} />
                <View style={styles.microsoftSquare} />
                <View style={styles.microsoftSquare} />
              </View>
            </View>
            <Text style={styles.buttonLabel}>Iniciar sesión con Microsoft</Text>
          </Pressable>

          <Pressable
            onPress={() => Alert.alert("Login con Gmail próximamente")}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.buttonBase,
              styles.gmailButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <View style={styles.gmailIcon} />
            <Text style={styles.buttonLabel}>Iniciar sesión con Gmail</Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]}
          >
            <Text style={styles.backLabel}>← Volver</Text>
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
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  brandBlock: {
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.xxl,
  },
  mark: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  markText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xl + 2,
    fontWeight: typography.weights.bold,
    letterSpacing: 1,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeights.xl,
    textAlign: "center",
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.md,
    textAlign: "center",
  },
  supporting: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    lineHeight: typography.lineHeights.sm,
    textAlign: "center",
  },
  actions: {
    width: "100%",
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  buttonBase: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 54,
    paddingHorizontal: spacing.lg,
    borderRadius: 14,
    gap: spacing.sm,
  },
  microsoftButton: {
    backgroundColor: "#2563EB",
  },
  gmailButton: {
    backgroundColor: "#DC2626",
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  microsoftIcon: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  microsoftGrid: {
    width: 16,
    height: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
  },
  microsoftSquare: {
    width: 7,
    height: 7,
    borderRadius: 2,
    backgroundColor: colors.onPrimary,
  },
  gmailIcon: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: colors.onPrimary,
  },
  buttonLabel: {
    color: colors.onPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semiBold,
    textAlign: "center",
  },
  backButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
    paddingVertical: spacing.xs,
  },
  backButtonPressed: {
    opacity: 0.92,
  },
  backLabel: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
  },
  footerNote: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    lineHeight: typography.lineHeights.xs,
    textAlign: "center",
  },
});