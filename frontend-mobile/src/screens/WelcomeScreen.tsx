import React from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { ROUTES } from "../navigation/routes";
import { colors, typography } from "../theme";
import { spacing } from "../constants/spacing";

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.Welcome>;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.background} pointerEvents="none">
        <View style={styles.watermarkPlate}>
          <View style={styles.plateOuter} />
          <View style={styles.plateInner} />
          <View style={styles.plateFork} />
          <View style={styles.plateKnife} />
        </View>
        <View style={styles.watermarkCloche}>
          <View style={styles.clocheTop} />
          <View style={styles.clocheBase} />
          <View style={styles.clocheHandle} />
        </View>
        <View style={styles.watermarkBowl}>
          <View style={styles.bowlRim} />
          <View style={styles.bowlBody} />
          <View style={styles.bowlSteam} />
        </View>
        <View style={styles.watermarkBurger}>
          <View style={styles.burgerTop} />
          <View style={styles.burgerLayer} />
          <View style={styles.burgerBottom} />
        </View>
      </View>

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
            <View style={[styles.optionIcon, styles.optionIconStudent]}>
              <View style={[styles.capTop, styles.capStudent]} />
              <View style={[styles.capBase, styles.capStudent]} />
              <View style={[styles.capTassel, styles.capStudent]} />
            </View>
            <Text style={styles.optionTitle}>Estudiante</Text>
            <Text style={styles.optionSubtitle}>Cuenta institucional</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate(ROUTES.Login)}
            style={({ pressed }) => [styles.optionCard, pressed && styles.optionPressed]}
          >
            <View style={[styles.optionIcon, styles.optionIconCommunity]}>
              <View style={styles.peopleHeadsRow}>
                <View style={[styles.peopleHead, styles.peopleCommunity]} />
                <View style={[styles.peopleHead, styles.peopleCommunity]} />
              </View>
              <View style={[styles.peopleShoulders, styles.peopleCommunity]} />
            </View>
            <Text style={styles.optionTitle}>Comunidad</Text>
            <Text style={styles.optionSubtitle}>Personal y usuarios</Text>
          </Pressable>
        </View>

        <Text style={styles.footerNote}>
          Dirección de Bienestar Universitario • ULEAM
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6EFE8",
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  watermarkPlate: {
    position: "absolute",
    top: -18,
    left: -18,
    width: 220,
    height: 220,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.15,
  },
  plateOuter: {
    width: 180,
    height: 180,
    borderRadius: 180,
    borderWidth: 1.5,
    borderColor: "rgba(224, 198, 188, 0.8)",
  },
  plateInner: {
    position: "absolute",
    width: 128,
    height: 128,
    borderRadius: 128,
    borderWidth: 1.5,
    borderColor: "rgba(224, 198, 188, 0.8)",
  },
  plateFork: {
    position: "absolute",
    right: 50,
    top: 66,
    width: 36,
    height: 2,
    borderRadius: 2,
    backgroundColor: "rgba(224, 198, 188, 0.8)",
    transform: [{ rotate: "-20deg" }],
  },
  plateKnife: {
    position: "absolute",
    right: 42,
    top: 88,
    width: 26,
    height: 2,
    borderRadius: 2,
    backgroundColor: "rgba(224, 198, 188, 0.8)",
    transform: [{ rotate: "-20deg" }],
  },
  watermarkCloche: {
    position: "absolute",
    top: -18,
    right: -18,
    width: 190,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.15,
  },
  clocheTop: {
    width: 132,
    height: 72,
    borderTopLeftRadius: 80,
    borderTopRightRadius: 80,
    borderWidth: 1.5,
    borderColor: "rgba(224, 198, 188, 0.8)",
  },
  clocheBase: {
    width: 150,
    height: 12,
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "rgba(224, 198, 188, 0.8)",
  },
  clocheHandle: {
    position: "absolute",
    top: 34,
    width: 14,
    height: 8,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "rgba(224, 198, 188, 0.8)",
  },
  watermarkBowl: {
    position: "absolute",
    bottom: -18,
    left: -18,
    width: 210,
    height: 155,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.15,
  },
  bowlRim: {
    width: 150,
    height: 18,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "rgba(224, 198, 188, 0.8)",
  },
  bowlBody: {
    width: 150,
    height: 64,
    marginTop: 6,
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1.5,
    borderColor: "rgba(224, 198, 188, 0.8)",
  },
  bowlSteam: {
    position: "absolute",
    top: 40,
    width: 54,
    height: 16,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "rgba(224, 198, 188, 0.6)",
  },
  watermarkBurger: {
    position: "absolute",
    bottom: -18,
    right: -18,
    width: 200,
    height: 130,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.15,
  },
  burgerTop: {
    width: 150,
    height: 38,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(224, 198, 188, 0.8)",
  },
  burgerLayer: {
    width: 140,
    height: 18,
    marginTop: 6,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "rgba(224, 198, 188, 0.7)",
  },
  burgerBottom: {
    width: 150,
    height: 28,
    marginTop: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(224, 198, 188, 0.8)",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  mark: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
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
    marginTop: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.sm,
    textAlign: "center",
    marginTop: spacing.sm,
    maxWidth: 340,
  },
  optionsRow: {
    marginTop: spacing.lg,
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "center",
    width: "100%",
  },
  optionCard: {
    width: "46%",
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    shadowColor: "rgba(61, 45, 38, 0.22)",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  optionPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.96,
    borderColor: colors.borderStrong,
  },
  optionIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  optionIconStudent: {
    backgroundColor: "rgba(227, 240, 229, 0.95)",
    borderWidth: 1,
    borderColor: "rgba(98, 130, 105, 0.28)",
  },
  optionIconCommunity: {
    backgroundColor: "rgba(248, 227, 228, 0.95)",
    borderWidth: 1,
    borderColor: "rgba(185, 86, 92, 0.28)",
  },
  capTop: {
    width: 36,
    height: 4,
    borderRadius: 3,
  },
  capBase: {
    width: 40,
    height: 4,
    borderRadius: 3,
    marginTop: 7,
  },
  capTassel: {
    position: "absolute",
    right: 8,
    top: 9,
    width: 14,
    height: 1,
    borderRadius: 2,
  },
  capStudent: {
    backgroundColor: "#5F7E59",
  },
  peopleHeadsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  peopleHead: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  peopleShoulders: {
    marginTop: 6,
    width: 34,
    height: 10,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomWidth: 0,
    borderWidth: 1.5,
    backgroundColor: "transparent",
  },
  peopleCommunity: {
    backgroundColor: "#B3585F",
  },
  optionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeights.md,
    textAlign: "center",
  },
  optionSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.sm,
    textAlign: "center",
  },
  footerNote: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    lineHeight: typography.lineHeights.xs,
    marginTop: spacing.xxl,
    textAlign: "center",
    opacity: 0.85,
  },
});
