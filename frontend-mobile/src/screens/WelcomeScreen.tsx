import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { spacing } from "../constants/spacing";
import { ROUTES } from "../navigation/routes";
import { RootStackParamList } from "../navigation/types";
import { colors, typography } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.Welcome>;

const SCREEN_BACKGROUND = "#F6EFE8";

const decorativeIcons = [
  {
    name: "silverware-fork-knife",
    size: 70,
    color: "rgba(191, 156, 141, 0.13)",
    style: { top: 34, left: 6, transform: [{ rotate: "-14deg" }] },
  },
  {
    name: "food-apple-outline",
    size: 62,
    color: "rgba(201, 168, 149, 0.12)",
    style: { top: 96, right: 8, transform: [{ rotate: "12deg" }] },
  },
  {
    name: "coffee-outline",
    size: 54,
    color: "rgba(191, 156, 141, 0.11)",
    style: { top: 226, left: 2, transform: [{ rotate: "-10deg" }] },
  },
  {
    name: "bread-slice-outline",
    size: 56,
    color: "rgba(201, 168, 149, 0.12)",
    style: { top: 286, right: 18, transform: [{ rotate: "-10deg" }] },
  },
  {
    name: "food-croissant",
    size: 48,
    color: "rgba(191, 156, 141, 0.1)",
    style: { top: "41%", left: 22, transform: [{ rotate: "-8deg" }] },
  },
  {
    name: "cupcake-outline",
    size: 46,
    color: "rgba(201, 168, 149, 0.11)",
    style: { top: "45%", right: 24, transform: [{ rotate: "10deg" }] },
  },
  {
    name: "chef-hat",
    size: 52,
    color: "rgba(191, 156, 141, 0.11)",
    style: { bottom: 178, left: 22, transform: [{ rotate: "-8deg" }] },
  },
  {
    name: "hamburger",
    size: 66,
    color: "rgba(201, 168, 149, 0.14)",
    style: { bottom: 122, right: 2, transform: [{ rotate: "9deg" }] },
  },
  {
    name: "pizza",
    size: 60,
    color: "rgba(191, 156, 141, 0.11)",
    style: { bottom: 40, left: 8, transform: [{ rotate: "-12deg" }] },
  },
  {
    name: "ice-cream",
    size: 52,
    color: "rgba(201, 168, 149, 0.12)",
    style: { bottom: 38, right: 32, transform: [{ rotate: "12deg" }] },
  },
] as const;

export function WelcomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const isCompact = height < 760 || width < 360;
  const backgroundScale = isCompact ? 0.9 : 1;
  const cardMinHeight = isCompact ? 148 : 156;
  const iconSize = isCompact ? 34 : 38;

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={SCREEN_BACKGROUND} />

      <View style={styles.container}>
        <View style={styles.background} pointerEvents="none">
          {decorativeIcons.map((icon, index) => (
            <MaterialCommunityIcons
              key={`${icon.name}-${index}`}
              name={icon.name}
              size={icon.size * backgroundScale}
              color={icon.color}
              style={[styles.backgroundIcon, icon.style]}
            />
          ))}
        </View>

        <View style={styles.layout}>
          <View style={styles.centerContent}>
            <View style={[styles.isotype, isCompact && styles.isotypeCompact]}>
              <Text
                style={[
                  styles.isotypeText,
                  isCompact && styles.isotypeTextCompact,
                ]}
              >
                U
              </Text>
            </View>

            <Text style={[styles.title, isCompact && styles.titleCompact]}>
              Comedor ULEAM
            </Text>

            <Text style={[styles.subtitle, isCompact && styles.subtitleCompact]}>
              Selecciona tu tipo de usuario para continuar
            </Text>

            <View
              style={[
                styles.optionsRow,
                { marginTop: isCompact ? spacing.lg : spacing.xl },
              ]}
            >
              <Pressable
                accessibilityRole="button"
                onPress={() => navigation.navigate(ROUTES.StudentAccess)}
                style={({ pressed }) => [
                  styles.optionCard,
                  { minHeight: cardMinHeight },
                  pressed && styles.optionPressed,
                ]}
              >
                <MaterialCommunityIcons
                  name="school-outline"
                  size={iconSize}
                  color={colors.success}
                  style={styles.optionIcon}
                />
                <Text style={styles.optionTitle}>Estudiante</Text>
                <Text style={styles.optionSubtitle}>Cuenta institucional</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => navigation.navigate(ROUTES.Login)}
                style={({ pressed }) => [
                  styles.optionCard,
                  { minHeight: cardMinHeight },
                  pressed && styles.optionPressed,
                ]}
              >
                <MaterialCommunityIcons
                  name="account-group-outline"
                  size={iconSize}
                  color={colors.error}
                  style={styles.optionIcon}
                />
                <Text style={styles.optionTitle}>Comunidad</Text>
                <Text style={styles.optionSubtitle}>Personal y usuarios</Text>
              </Pressable>
            </View>
          </View>

          <Text
            style={[
              styles.footerNote,
              {
                paddingBottom: Math.max(insets.bottom, spacing.md),
              },
            ]}
          >
            {"Direcci\u00f3n de Bienestar Universitario \u2022 ULEAM"}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: SCREEN_BACKGROUND,
  },
  container: {
    flex: 1,
    backgroundColor: SCREEN_BACKGROUND,
    overflow: "hidden",
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundIcon: {
    position: "absolute",
  },
  layout: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  centerContent: {
    flex: 1,
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: spacing.md,
  },
  isotype: {
    width: 86,
    height: 86,
    borderRadius: 28,
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
  isotypeCompact: {
    width: 78,
    height: 78,
    borderRadius: 24,
  },
  isotypeText: {
    color: colors.onPrimary,
    fontSize: 39,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.8,
  },
  isotypeTextCompact: {
    fontSize: 34,
  },
  title: {
    marginTop: spacing.lg,
    color: colors.textPrimary,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.xxl,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  titleCompact: {
    marginTop: spacing.md,
    fontSize: 30,
    lineHeight: 36,
  },
  subtitle: {
    marginTop: spacing.sm,
    maxWidth: 312,
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    textAlign: "center",
  },
  subtitleCompact: {
    maxWidth: 288,
  },
  optionsRow: {
    width: "100%",
    maxWidth: 336,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  optionCard: {
    width: "47.5%",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    borderWidth: 1,
    borderColor: "rgba(231, 225, 218, 0.92)",
    shadowColor: "#34241C",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  optionPressed: {
    transform: [{ translateY: 1 }],
    opacity: 0.98,
  },
  optionIcon: {
    marginBottom: spacing.sm,
  },
  optionTitle: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.md,
    textAlign: "center",
  },
  optionSubtitle: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    textAlign: "center",
  },
  footerNote: {
    width: "100%",
    alignSelf: "center",
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    textAlign: "center",
    color: colors.textMuted,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    opacity: 0.9,
  },
});
