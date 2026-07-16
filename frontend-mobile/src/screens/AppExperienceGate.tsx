import React, { ReactNode, useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppButton } from "../components";
import { spacing } from "../constants/spacing";
import { useAppPreferences } from "../context/AppPreferencesContext";
import { useReduceMotion } from "../hooks/useReduceMotion";
import { designSystem, typography } from "../theme";
import { studentPalette } from "../theme/studentPalette";

type OnboardingPage = {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  title: string;
  message: string;
};

const ONBOARDING_PAGES: OnboardingPage[] = [
  {
    icon: "silverware-fork-knife",
    title: "Comida del campus",
    message: "Explora restaurantes y platos disponibles desde tu telefono.",
  },
  {
    icon: "cart-outline",
    title: "Explorar y pedir",
    message: "Arma tu carrito, revisa el total y continua con seguridad.",
  },
  {
    icon: "progress-clock",
    title: "Seguimiento",
    message: "Sigue tu pedido en tiempo real.",
  },
  {
    icon: "qrcode-scan",
    title: "Retiro por QR",
    message: "Retira tu pedido de forma segura con QR.",
  },
];

export function AppExperienceGate({ children }: { children: ReactNode }) {
  const { completeOnboarding, completeStartup, hasSeenOnboarding } =
    useAppPreferences();
  const [showStartup, setShowStartup] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(!hasSeenOnboarding);

  const handleStartupDone = () => {
    completeStartup();
    setShowStartup(false);
  };

  const handleOnboardingDone = () => {
    completeOnboarding();
    setShowOnboarding(false);
  };

  if (showStartup) {
    return <StartupAnimation onDone={handleStartupDone} />;
  }

  if (showOnboarding) {
    return <OnboardingFlow onDone={handleOnboardingDone} />;
  }

  return <>{children}</>;
}

function StartupAnimation({ onDone }: { onDone: () => void }) {
  const reduceMotion = useReduceMotion();
  const spin = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(reduceMotion ? 1 : 0.7)).current;
  const opacity = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;

  useEffect(() => {
    if (reduceMotion) {
      const timer = setTimeout(onDone, 450);
      return () => clearTimeout(timer);
    }

    Vibration.vibrate(18);
    Animated.parallel([
      Animated.timing(spin, {
        toValue: 1,
        duration: 850,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        damping: 8,
        stiffness: 120,
        mass: 0.8,
        useNativeDriver: true,
      }),
    ]).start(() => onDone());
  }, [onDone, opacity, reduceMotion, scale, spin]);

  const rotation = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.startup}>
      <Animated.View
        style={[
          styles.startupMark,
          { opacity, transform: [{ rotate: rotation }, { scale }] },
        ]}
      >
        {["carrot", "corn", "food-apple", "silverware-fork-knife"].map(
          (iconName, index) => (
            <View
              key={iconName}
              style={[styles.ingredient, ingredientStyles[index]]}
            >
              <MaterialCommunityIcons
                name={
                  iconName as React.ComponentProps<
                    typeof MaterialCommunityIcons
                  >["name"]
                }
                size={22}
                color={designSystem.colors.primary}
              />
            </View>
          )
        )}
        <View style={styles.logoCore}>
          <MaterialCommunityIcons
            name="food"
            size={34}
            color={designSystem.colors.textInverted}
          />
        </View>
      </Animated.View>
      <Text style={styles.startupText}>Comedor ULEAM</Text>
    </View>
  );
}

function OnboardingFlow({ onDone }: { onDone: () => void }) {
  const [page, setPage] = useState(0);
  const current = ONBOARDING_PAGES[page];
  const isLast = page === ONBOARDING_PAGES.length - 1;
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();
  const opacity = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1);
      translateX.setValue(0);
      return;
    }

    opacity.setValue(0);
    translateX.setValue(14);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: designSystem.animation.normal,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: designSystem.animation.normal,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, page, reduceMotion, translateX]);

  return (
    <View
      style={[
        styles.onboarding,
        {
          paddingTop: insets.top + spacing.md,
          paddingBottom: insets.bottom + spacing.lg,
        },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Omitir onboarding"
        onPress={onDone}
        style={styles.skipButton}
      >
        <Text style={styles.skipText}>Omitir</Text>
      </Pressable>

      <Animated.View
        style={[
          styles.onboardingContent,
          { opacity, transform: [{ translateX }] },
        ]}
      >
        <OnboardingMiniVisual icon={current.icon} />
        <Text style={styles.onboardingStep}>
          {page + 1} de {ONBOARDING_PAGES.length}
        </Text>
        <Text style={styles.onboardingTitle}>{current.title}</Text>
        <Text style={styles.onboardingMessage}>{current.message}</Text>
      </Animated.View>

      <View style={styles.onboardingFooter}>
        <View style={styles.dots}>
          {ONBOARDING_PAGES.map((item, index) => (
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
              onDone();
              return;
            }
            setPage((value) => value + 1);
          }}
        />
      </View>
    </View>
  );
}

export function OnboardingMiniVisual({
  icon,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
}) {
  return (
    <View style={styles.onboardingVisual}>
      <View style={styles.visualShapeLarge} />
      <View style={styles.visualShapeSmall} />
      <View style={styles.onboardingIcon}>
        <MaterialCommunityIcons
          name={icon}
          size={48}
          color={designSystem.colors.primary}
        />
      </View>
    </View>
  );
}

const ingredientStyles = [
  { top: 0, left: 42 },
  { top: 42, right: 0 },
  { bottom: 0, left: 42 },
  { top: 42, left: 0 },
] as const;

const styles = StyleSheet.create({
  startup: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: studentPalette.background,
    gap: spacing.lg,
  },
  startupMark: {
    width: 126,
    height: 126,
  },
  ingredient: {
    position: "absolute",
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: designSystem.colors.surface,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
    ...designSystem.shadows.sm,
  },
  logoCore: {
    position: "absolute",
    top: 38,
    left: 38,
    width: 50,
    height: 50,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: designSystem.colors.primary,
  },
  startupText: {
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  onboarding: {
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
    fontWeight: typography.weights.bold,
  },
  onboardingContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
  onboardingVisual: {
    width: 184,
    height: 184,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  visualShapeLarge: {
    position: "absolute",
    width: 156,
    height: 156,
    borderRadius: 999,
    backgroundColor: designSystem.colors.primaryFaint,
  },
  visualShapeSmall: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 999,
    right: 16,
    bottom: 18,
    backgroundColor: designSystem.colors.secondarySoft,
  },
  onboardingIcon: {
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
  onboardingStep: {
    color: designSystem.colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  onboardingTitle: {
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.xxl,
    lineHeight: typography.lineHeights.xxl,
    fontWeight: typography.weights.bold,
    textAlign: "center",
  },
  onboardingMessage: {
    maxWidth: 320,
    color: designSystem.colors.textSecondary,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    textAlign: "center",
  },
  onboardingFooter: {
    gap: spacing.lg,
  },
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
