import React, { useEffect, useLayoutEffect, useRef } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Alert,
  Animated,
  Easing,
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

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.StudentAccess>;

const SCREEN_BACKGROUND = "#F6EFE8";
const AUTH_BUTTON_BACKGROUND = "rgba(255, 255, 255, 0.92)";
const AUTH_BUTTON_BORDER = "rgba(231, 225, 218, 0.96)";
const ENTRANCE_DURATION = 420;
const ENTRANCE_OFFSET = 10;
const ENTRANCE_EASING = Easing.out(Easing.cubic);

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
    name: "cupcake",
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

function useEntranceAnimation(delay: number) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(ENTRANCE_OFFSET)).current;

  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(ENTRANCE_OFFSET);

    const animation = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: ENTRANCE_DURATION,
          easing: ENTRANCE_EASING,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: ENTRANCE_DURATION,
          easing: ENTRANCE_EASING,
          useNativeDriver: true,
        }),
      ]),
    ]);

    animation.start();

    return () => {
      animation.stop();
    };
  }, [delay, opacity, translateY]);

  return {
    opacity,
    transform: [{ translateY }],
  };
}

export function StudentAccessScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const isCompact = height < 760 || width < 360;
  const backgroundScale = isCompact ? 0.9 : 1;
  const logoEntrance = useEntranceAnimation(40);
  const textEntrance = useEntranceAnimation(130);
  const actionsEntrance = useEntranceAnimation(220);
  const footerEntrance = useEntranceAnimation(300);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Acceso estudiante",
      headerShadowVisible: false,
      headerTintColor: colors.textPrimary,
      headerStyle: {
        backgroundColor: SCREEN_BACKGROUND,
      },
    });
  }, [navigation]);

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
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
            <Animated.View style={logoEntrance}>
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
            </Animated.View>

            <Animated.View style={[styles.textBlock, textEntrance]}>
              <Text
                style={[styles.title, isCompact && styles.titleCompact]}
              >
                Comedor ULEAM
              </Text>

              <Text style={styles.subtitle}>Acceso institucional</Text>

              <Text
                style={[
                  styles.supporting,
                  isCompact && styles.supportingCompact,
                ]}
              >
                {"Usa tu cuenta para continuar"}
              </Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.actions,
                isCompact && styles.actionsCompact,
                actionsEntrance,
              ]}
            >
              <Pressable
                accessibilityRole="button"
                onPress={() => navigation.navigate(ROUTES.Login)}
                style={({ pressed }) => [
                  styles.authButton,
                  isCompact && styles.authButtonCompact,
                  pressed && styles.authButtonPressed,
                ]}
              >
                <View
                  style={[
                    styles.authButtonContent,
                    isCompact && styles.authButtonContentCompact,
                  ]}
                >
                  <View style={styles.iconSlot}>
                    <View style={styles.microsoftGrid}>
                      <View
                        style={[styles.microsoftSquare, styles.microsoftSquareRed]}
                      />
                      <View
                        style={[styles.microsoftSquare, styles.microsoftSquareGreen]}
                      />
                      <View
                        style={[styles.microsoftSquare, styles.microsoftSquareBlue]}
                      />
                      <View
                        style={[styles.microsoftSquare, styles.microsoftSquareYellow]}
                      />
                    </View>
                  </View>

                  <Text style={styles.authButtonLabel}>
                    {"Iniciar sesi\u00f3n con Microsoft"}
                  </Text>

                  <View style={styles.iconSlot} />
                </View>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  Alert.alert(
                    "Pr\u00f3ximamente",
                    "El acceso con Gmail estar\u00e1 disponible pronto."
                  )
                }
                style={({ pressed }) => [
                  styles.authButton,
                  isCompact && styles.authButtonCompact,
                  pressed && styles.authButtonPressed,
                ]}
              >
                <View
                  style={[
                    styles.authButtonContent,
                    isCompact && styles.authButtonContentCompact,
                  ]}
                >
                  <View style={styles.iconSlot}>
                    <MaterialCommunityIcons
                      name="gmail"
                      size={20}
                      color="#EA4335"
                    />
                  </View>

                  <Text style={styles.authButtonLabel}>
                    {"Iniciar sesi\u00f3n con Gmail"}
                  </Text>

                  <View style={styles.iconSlot} />
                </View>
              </Pressable>
            </Animated.View>
          </View>

          <Animated.Text
            style={[
              styles.footerNote,
              footerEntrance,
              {
                paddingBottom: Math.max(insets.bottom, spacing.md),
              },
            ]}
          >
            {"Universidad Laica Eloy Alfaro de Manab\u00ed"}
          </Animated.Text>
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
  textBlock: {
    width: "100%",
    alignItems: "center",
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
    color: colors.textSecondary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semiBold,
    lineHeight: typography.lineHeights.md,
    textAlign: "center",
  },
  supporting: {
    marginTop: spacing.xs,
    maxWidth: 280,
    color: colors.textMuted,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    textAlign: "center",
  },
  supportingCompact: {
    maxWidth: 252,
  },
  actions: {
    width: "100%",
    maxWidth: 356,
    gap: spacing.md,
    marginTop: spacing.xxl,
  },
  actionsCompact: {
    marginTop: spacing.xl,
  },
  authButton: {
    minHeight: 62,
    borderRadius: 18,
    backgroundColor: AUTH_BUTTON_BACKGROUND,
    borderWidth: 1,
    borderColor: AUTH_BUTTON_BORDER,
    paddingHorizontal: spacing.lg,
    shadowColor: "#34241C",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  authButtonCompact: {
    minHeight: 58,
  },
  authButtonPressed: {
    opacity: 0.96,
    transform: [{ translateY: 1 }, { scale: 0.985 }],
  },
  authButtonContent: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
  },
  authButtonContentCompact: {
    minHeight: 58,
  },
  iconSlot: {
    width: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  microsoftGrid: {
    width: 18,
    height: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
  },
  microsoftSquare: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  microsoftSquareRed: {
    backgroundColor: "#F25022",
  },
  microsoftSquareGreen: {
    backgroundColor: "#7FBA00",
  },
  microsoftSquareBlue: {
    backgroundColor: "#2563EB",
  },
  microsoftSquareYellow: {
    backgroundColor: "#FFB900",
  },
  authButtonLabel: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semiBold,
    lineHeight: typography.lineHeights.md,
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
