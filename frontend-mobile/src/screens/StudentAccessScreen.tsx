import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { ROUTES } from "../navigation/routes";
import { Screen } from "../components/Screen";
import { AppButton } from "../components/AppButton";
import { colors, typography } from "../theme";
import { spacing } from "../constants/spacing";

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.StudentAccess>;

export function StudentAccessScreen({ navigation }: Props) {
  return (
    <Screen style={styles.container}>
      <View style={styles.background} pointerEvents="none">
        <View style={styles.bgBlobTop} />
        <View style={styles.bgBlobBottom} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.mark}>
            <Text style={styles.markText}>U</Text>
          </View>

          <Text style={styles.title}>Acceso estudiante</Text>
          <Text style={styles.subtitle}>
            Continúa para iniciar sesión y gestionar tus reservas en el Comedor ULEAM.
          </Text>

          <View style={styles.infoRow}>
            <View style={styles.dot} />
            <Text style={styles.infoText}>
              Recomendado: usa tu correo institucional.
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <AppButton
            label="Continuar al login"
            onPress={() => navigation.navigate(ROUTES.Login)}
          />
          <AppButton
            label="Volver"
            variant="secondary"
            onPress={() => navigation.goBack()}
          />
        </View>

        <Text style={styles.footerNote}>ULEAM • Comedor Universitario</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  bgBlobTop: {
    position: "absolute",
    top: -160,
    left: -140,
    width: 360,
    height: 360,
    borderRadius: 360,
    backgroundColor: colors.surfaceMuted,
    opacity: 0.95,
  },
  bgBlobBottom: {
    position: "absolute",
    bottom: -170,
    right: -130,
    width: 340,
    height: 340,
    borderRadius: 340,
    backgroundColor: colors.primarySoft,
    opacity: 0.85,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.sm,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 1,
  },
  mark: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
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
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.md,
  },
  infoRow: {
    marginTop: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  infoText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    lineHeight: typography.lineHeights.sm,
  },
  actions: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  footerNote: {
    marginTop: spacing.lg,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    lineHeight: typography.lineHeights.xs,
  },
});
