import React, { useEffect, useRef } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Screen } from "../components";
import { spacing } from "../constants/spacing";
import { useReduceMotion } from "../hooks/useReduceMotion";
import { ROUTES } from "../navigation/routes";
import { StudentStackParamList } from "../navigation/types";
import { designSystem, typography } from "../theme";
import { studentPalette } from "../theme/studentPalette";

type Props = NativeStackScreenProps<
  StudentStackParamList,
  typeof ROUTES.OnboardingStageDetail
>;

export const ONBOARDING_STAGE_DETAILS = [
  {
    icon: "silverware-fork-knife" as const,
    title: "Comida del campus",
    message:
      "Encuentra restaurantes y platos disponibles para elegir mejor antes de pedir.",
    steps: ["Revisa restaurantes", "Explora platos", "Guarda favoritos"],
  },
  {
    icon: "cart-outline" as const,
    title: "Explorar y pedir",
    message:
      "Agrega platos al carrito, revisa cantidades y confirma cuando estés listo.",
    steps: ["Busca un plato", "Agrega observaciones", "Continúa al resumen"],
  },
  {
    icon: "progress-clock" as const,
    title: "Seguimiento",
    message: "Sigue tu pedido en tiempo real y revisa el estado actualizado.",
    steps: ["Abre Mis reservas", "Consulta el detalle", "Actualiza el estado"],
  },
  {
    icon: "qrcode-scan" as const,
    title: "Retiro por QR",
    message: "Retira tu pedido de forma segura con QR cuando esté confirmado.",
    steps: ["Genera el QR", "Muéstralo al manager", "Espera la confirmación"],
  },
];

export function OnboardingStageDetailScreen({ route }: Props) {
  const stage = ONBOARDING_STAGE_DETAILS[route.params.index] ?? ONBOARDING_STAGE_DETAILS[0];
  const reduceMotion = useReduceMotion();
  const opacity = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;

  useEffect(() => {
    if (reduceMotion) return;
    Animated.timing(opacity, {
      toValue: 1,
      duration: designSystem.animation.normal,
      useNativeDriver: true,
    }).start();
  }, [opacity, reduceMotion]);

  return (
    <Screen style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Animated.View style={[styles.hero, { opacity }]}>
          <View style={styles.icon}>
            <MaterialCommunityIcons
              name={stage.icon}
              size={42}
              color={designSystem.colors.primary}
            />
          </View>
          <Text style={styles.title}>{stage.title}</Text>
          <Text style={styles.message}>{stage.message}</Text>
        </Animated.View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Cómo funciona</Text>
          {stage.steps.map((step, index) => (
            <View key={step} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

export function OnboardingStageCard({
  icon,
  index,
  message,
  onPress,
  title,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  index: number;
  message: string;
  onPress: () => void;
  title: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver ${title}`}
      onPress={onPress}
      style={({ pressed }) => [styles.stageCard, pressed && styles.pressed]}
    >
      <View style={styles.stageIcon}>
        <MaterialCommunityIcons
          name={icon}
          size={designSystem.iconSizes.md}
          color={designSystem.colors.primary}
        />
      </View>
      <View style={styles.stageText}>
        <Text style={styles.stageKicker}>Paso {index + 1}</Text>
        <Text style={styles.stageTitle}>{title}</Text>
        <Text style={styles.stageMessage} numberOfLines={2}>
          {message}
        </Text>
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={designSystem.iconSizes.md}
        color={designSystem.colors.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: studentPalette.background },
  scroll: { flex: 1, backgroundColor: "transparent" },
  content: { gap: spacing.md, paddingBottom: spacing.xxxl },
  hero: {
    alignItems: "center",
    padding: spacing.lg,
    borderRadius: 22,
    backgroundColor: designSystem.colors.surface,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
    ...designSystem.shadows.sm,
  },
  icon: {
    width: 86,
    height: 86,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: designSystem.colors.primaryFaint,
  },
  title: {
    marginTop: spacing.md,
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    textAlign: "center",
  },
  message: {
    marginTop: spacing.sm,
    color: designSystem.colors.textSecondary,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    textAlign: "center",
  },
  card: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: 20,
    backgroundColor: designSystem.colors.surface,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
  },
  sectionTitle: {
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  stepRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: designSystem.colors.primaryFaint,
  },
  stepNumberText: {
    color: designSystem.colors.primary,
    fontWeight: typography.weights.bold,
  },
  stepText: {
    flex: 1,
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
  },
  stageCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 18,
    backgroundColor: designSystem.colors.surface,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
    ...designSystem.shadows.sm,
  },
  pressed: { backgroundColor: designSystem.colors.surfacePressed },
  stageIcon: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: designSystem.colors.primaryFaint,
  },
  stageText: { flex: 1, minWidth: 0 },
  stageKicker: {
    color: designSystem.colors.primary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  stageTitle: {
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  stageMessage: {
    color: designSystem.colors.textSecondary,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
  },
});
