import React, { useEffect, useRef } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Svg, { Path } from "react-native-svg";
import {
  Animated,
  Easing,
  Image,
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

const SCREEN_BACKGROUND = "#F7E5CC";
const SURFACE = "#FFFFFF";
const ACCENT_ORANGE = "#F97316";
const TEXT_PRIMARY = "#2D221B";
const TEXT_SECONDARY = "#5F5048";
const TEXT_MUTED = "#8A7B73";
const DECOR_ORANGE = "rgba(249, 115, 22, 0.28)";
const DECOR_ORANGE_SOFT = "rgba(249, 115, 22, 0.18)";
const STUDENT_ICON_BG = "rgba(227, 240, 229, 0.96)";
const STUDENT_ICON_BORDER = "rgba(98, 130, 105, 0.28)";
const COMMUNITY_ICON_BG = "rgba(248, 227, 228, 0.96)";
const COMMUNITY_ICON_BORDER = "rgba(185, 86, 92, 0.28)";
const WELCOME_LOGO = require("../assets/images/logo_welcome_comedor_uleam.png");
const ENTRANCE_DURATION = 420;
const ENTRANCE_OFFSET = 10;
const ENTRANCE_EASING = Easing.out(Easing.cubic);

const decorativeIcons = [
  {
    name: "silverware-fork-knife",
    size: 68,
    color: "rgba(191, 156, 141, 0.12)",
    style: { top: 34, left: 10, transform: [{ rotate: "-14deg" }] },
  },
  {
    name: "food-apple-outline",
    size: 60,
    color: "rgba(201, 168, 149, 0.11)",
    style: { top: 94, right: 12, transform: [{ rotate: "12deg" }] },
  },
  {
    name: "coffee-outline",
    size: 52,
    color: "rgba(191, 156, 141, 0.1)",
    style: { top: 230, left: 4, transform: [{ rotate: "-10deg" }] },
  },
  {
    name: "bread-slice-outline",
    size: 54,
    color: "rgba(201, 168, 149, 0.1)",
    style: { top: 292, right: 20, transform: [{ rotate: "-10deg" }] },
  },
  {
    name: "food-croissant",
    size: 48,
    color: "rgba(191, 156, 141, 0.1)",
    style: { top: "41%", left: 24, transform: [{ rotate: "-8deg" }] },
  },
  {
    name: "cupcake",
    size: 44,
    color: "rgba(201, 168, 149, 0.1)",
    style: { top: "46%", right: 24, transform: [{ rotate: "10deg" }] },
  },
  {
    name: "chef-hat",
    size: 50,
    color: "rgba(191, 156, 141, 0.1)",
    style: { bottom: 184, left: 22, transform: [{ rotate: "-8deg" }] },
  },
  {
    name: "hamburger",
    size: 64,
    color: "rgba(201, 168, 149, 0.12)",
    style: { bottom: 126, right: 4, transform: [{ rotate: "9deg" }] },
  },
  {
    name: "pizza",
    size: 58,
    color: "rgba(191, 156, 141, 0.1)",
    style: { bottom: 40, left: 10, transform: [{ rotate: "-12deg" }] },
  },
  {
    name: "ice-cream",
    size: 50,
    color: "rgba(201, 168, 149, 0.11)",
    style: { bottom: 40, right: 34, transform: [{ rotate: "12deg" }] },
  },
] as const;

type WelcomeLayoutMetrics = {
  horizontalPadding: number;
  contentTopPadding: number;
  contentBottomPadding: number;
  logoSize: number;
  titleTopMargin: number;
  titleSize: number;
  titleLineHeight: number;
  subtitleTopMargin: number;
  subtitleSize: number;
  subtitleLineHeight: number;
  cardsTopMargin: number;
  cardsGap: number;
  cardMinHeight: number;
  cardRadius: number;
  cardPaddingVertical: number;
  cardIconShellSize: number;
  cardIconShellRadius: number;
  footerTopMargin: number;
  waveHeight: number;
  footerPanelTopPadding: number;
  footerPanelBottomPadding: number;
  footerArtHeight: number;
  footerArtLift: number;
  footerIconSize: number;
  footerTextTopGap: number;
  footerFontSize: number;
  footerLineHeight: number;
};

type DecorIconProps = {
  color: string;
  size: number;
};

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

const getLayoutMetrics = (
  width: number,
  height: number,
  bottomInset: number
): WelcomeLayoutMetrics => {
  return {
    horizontalPadding: clamp(Math.round(width * 0.06), 22, 28),
    contentTopPadding: clamp(Math.round(height * 0.025), 16, 24),
    contentBottomPadding: clamp(Math.round(height * 0.018), 10, 16),
    logoSize: clamp(Math.round(width * 0.4), 146, 170),
    titleTopMargin: clamp(Math.round(width * 0.034), 8, 12),
    titleSize: clamp(Math.round(width * 0.078), 28, 32),
    titleLineHeight: clamp(Math.round(width * 0.088), 34, 38),
    subtitleTopMargin: clamp(Math.round(width * 0.025), 8, 10),
    subtitleSize: clamp(Math.round(width * 0.036), 14, 15),
    subtitleLineHeight: clamp(Math.round(width * 0.048), 19, 21),
    cardsTopMargin: clamp(Math.round(width * 0.058), 20, 26),
    cardsGap: clamp(Math.round(width * 0.032), 12, 14),
    cardMinHeight: clamp(Math.round(width * 0.42), 148, 158),
    cardRadius: clamp(Math.round(width * 0.058), 20, 22),
    cardPaddingVertical: clamp(Math.round(width * 0.046), 16, 20),
    cardIconShellSize: clamp(Math.round(width * 0.16), 56, 62),
    cardIconShellRadius: clamp(Math.round(width * 0.046), 16, 18),
    footerTopMargin: clamp(Math.round(height * 0.008), 4, 10),
    waveHeight: clamp(Math.round(width * 0.136), 50, 58),
    footerPanelTopPadding: clamp(Math.round(width * 0.006), 0, 3),
    footerPanelBottomPadding: Math.max(bottomInset + 12, 20),
    footerArtHeight: clamp(Math.round(width * 0.215), 74, 84),
    footerArtLift: clamp(Math.round(width * 0.054), 18, 22),
    footerIconSize: clamp(Math.round(width * 0.126), 46, 52),
    footerTextTopGap: clamp(Math.round(width * 0.018), 4, 7),
    footerFontSize: clamp(Math.round(width * 0.03), 12, 13),
    footerLineHeight: clamp(Math.round(width * 0.04), 16, 18),
  };
};

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

function DecorBowlIcon({ color, size }: DecorIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 72 72">
      <Path
        d="M18 42 H54"
        stroke={color}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M22 42 C25 52 47 52 50 42"
        stroke={color}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M28 31 C24 27 32 24 28 19"
        stroke={color}
        strokeWidth={2.6}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M38 31 C34 27 42 24 38 19"
        stroke={color}
        strokeWidth={2.6}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M48 32 L55 25"
        stroke={color}
        strokeWidth={2.6}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function DecorCupIcon({ color, size }: DecorIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 72 72">
      <Path
        d="M27 23 H45 L42 53 H30 Z"
        stroke={color}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M32 33 H40"
        stroke={color}
        strokeWidth={2.4}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M36 14 V23"
        stroke={color}
        strokeWidth={2.6}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function DecorLeafIcon({ color, size }: DecorIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 72 72">
      <Path
        d="M18 43 C27 24 47 18 57 22 C52 39 39 50 23 47 C20 46 19 45 18 43 Z"
        stroke={color}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M23 44 C34 39 43 31 55 24"
        stroke={color}
        strokeWidth={2.3}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M22 47 L15 57"
        stroke={color}
        strokeWidth={2.6}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function WelcomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const metrics = getLayoutMetrics(width, height, insets.bottom);
  const isCompact = height < 760 || width < 360;
  const backgroundScale = isCompact ? 0.9 : 1;
  const footerArtWidth = Math.min(width - metrics.horizontalPadding * 2, 320);
  const bowlSize = metrics.footerIconSize;
  const cupSize = metrics.footerIconSize - 2;
  const leafSize = metrics.footerIconSize - 4;
  const waveWidth = Math.max(width, 320);
  const wavePath = [
    `M 0 ${Math.round(metrics.waveHeight * 0.44)}`,
    `C ${Math.round(waveWidth * 0.15)} ${Math.round(metrics.waveHeight * 0.18)}, ${Math.round(
      waveWidth * 0.34
    )} ${Math.round(metrics.waveHeight * 0.82)}, ${Math.round(waveWidth * 0.52)} ${Math.round(
      metrics.waveHeight * 0.68
    )}`,
    `C ${Math.round(waveWidth * 0.7)} ${Math.round(metrics.waveHeight * 0.54)}, ${Math.round(
      waveWidth * 0.86
    )} ${Math.round(metrics.waveHeight * 0.14)}, ${waveWidth} ${Math.round(
      metrics.waveHeight * 0.3
    )}`,
    `L ${waveWidth} ${metrics.waveHeight}`,
    `L 0 ${metrics.waveHeight}`,
    "Z",
  ].join(" ");

  const logoEntrance = useEntranceAnimation(40);
  const textEntrance = useEntranceAnimation(130);
  const cardsEntrance = useEntranceAnimation(220);
  const footerEntrance = useEntranceAnimation(300);

  const footerAccentIcons = [
    {
      name: "circle-medium" as const,
      size: clamp(Math.round(metrics.footerIconSize * 0.24), 12, 16),
      style: {
        top: Math.round(metrics.footerArtHeight * 0.26),
        left: Math.round(footerArtWidth * 0.03),
      },
    },
    {
      name: "circle-medium" as const,
      size: clamp(Math.round(metrics.footerIconSize * 0.24), 12, 16),
      style: {
        top: Math.round(metrics.footerArtHeight * 0.6),
        left: Math.round(footerArtWidth * 0.68),
      },
    },
    {
      name: "star-four-points-outline" as const,
      size: clamp(Math.round(metrics.footerIconSize * 0.28), 16, 18),
      style: {
        top: Math.round(metrics.footerArtHeight * 0.12),
        right: Math.round(footerArtWidth * 0.02),
      },
    },
    {
      name: "star-four-points-outline" as const,
      size: clamp(Math.round(metrics.footerIconSize * 0.28), 16, 18),
      style: {
        top: Math.round(metrics.footerArtHeight * 0.74),
        left: Math.round(footerArtWidth * 0.12),
      },
    },
  ];

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
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

        <View style={styles.screenLayout}>
          <View
            style={[
              styles.mainSection,
              {
                paddingTop: metrics.contentTopPadding,
                paddingBottom: metrics.contentBottomPadding,
                paddingHorizontal: metrics.horizontalPadding,
              },
            ]}
          >
            <Animated.View
              style={[
                styles.logoBlock,
                {
                  width: metrics.logoSize,
                  height: metrics.logoSize,
                },
                logoEntrance,
              ]}
            >
              <Image
                source={WELCOME_LOGO}
                resizeMode="contain"
                style={[
                  styles.logoImage,
                  {
                    width: metrics.logoSize,
                    height: metrics.logoSize,
                  },
                ]}
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.textBlock,
                { marginTop: metrics.titleTopMargin },
                textEntrance,
              ]}
            >
              <Text
                style={[
                  styles.title,
                  {
                    fontSize: metrics.titleSize,
                    lineHeight: metrics.titleLineHeight,
                  },
                ]}
              >
                Comedor ULEAM
              </Text>

              <Text
                style={[
                  styles.subtitle,
                  {
                    marginTop: metrics.subtitleTopMargin,
                    fontSize: metrics.subtitleSize,
                    lineHeight: metrics.subtitleLineHeight,
                  },
                ]}
              >
                Selecciona tu tipo de usuario para continuar
              </Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.optionsRow,
                {
                  marginTop: metrics.cardsTopMargin,
                  gap: metrics.cardsGap,
                },
                cardsEntrance,
              ]}
            >
              <Pressable
                accessibilityRole="button"
                onPress={() => navigation.navigate(ROUTES.StudentAccess)}
                style={({ pressed }) => [
                  styles.optionCard,
                  {
                    minHeight: metrics.cardMinHeight,
                    borderRadius: metrics.cardRadius,
                    paddingVertical: metrics.cardPaddingVertical,
                  },
                  pressed && styles.optionPressed,
                ]}
              >
                <View
                  style={[
                    styles.optionIconShell,
                    {
                      width: metrics.cardIconShellSize,
                      height: metrics.cardIconShellSize,
                      borderRadius: metrics.cardIconShellRadius,
                    },
                    styles.studentIconShell,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="school-outline"
                    size={isCompact ? 30 : 34}
                    color={colors.success}
                  />
                </View>
                <Text style={styles.optionTitle}>Estudiante</Text>
                <Text style={styles.optionSubtitle}>Cuenta institucional</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => navigation.navigate(ROUTES.Login)}
                style={({ pressed }) => [
                  styles.optionCard,
                  {
                    minHeight: metrics.cardMinHeight,
                    borderRadius: metrics.cardRadius,
                    paddingVertical: metrics.cardPaddingVertical,
                  },
                  pressed && styles.optionPressed,
                ]}
              >
                <View
                  style={[
                    styles.optionIconShell,
                    {
                      width: metrics.cardIconShellSize,
                      height: metrics.cardIconShellSize,
                      borderRadius: metrics.cardIconShellRadius,
                    },
                    styles.communityIconShell,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="account-group-outline"
                    size={isCompact ? 30 : 34}
                    color={colors.error}
                  />
                </View>
                <Text style={styles.optionTitle}>Comunidad</Text>
                <Text style={styles.optionSubtitle}>Personal y usuarios</Text>
              </Pressable>
            </Animated.View>
          </View>

          <Animated.View
            style={[
              styles.footerSection,
              { marginTop: metrics.footerTopMargin },
              footerEntrance,
            ]}
          >
            <Svg
              width="100%"
              height={metrics.waveHeight}
              viewBox={`0 0 ${waveWidth} ${metrics.waveHeight}`}
              preserveAspectRatio="none"
              style={styles.waveSvg}
            >
              <Path d={wavePath} fill={SURFACE} />
            </Svg>

            <View
              style={[
                styles.footerPanel,
                {
                  paddingTop: metrics.footerPanelTopPadding,
                  paddingBottom: metrics.footerPanelBottomPadding,
                  paddingHorizontal: metrics.horizontalPadding,
                },
              ]}
            >
              <View
                style={[
                  styles.footerArt,
                  {
                    height: metrics.footerArtHeight,
                    maxWidth: footerArtWidth,
                    marginTop: -metrics.footerArtLift,
                  },
                ]}
              >
                {footerAccentIcons.map((icon, index) => (
                  <MaterialCommunityIcons
                    key={`${icon.name}-${index}`}
                    name={icon.name}
                    size={icon.size}
                    color={DECOR_ORANGE_SOFT}
                    style={[styles.footerAccentIcon, icon.style]}
                  />
                ))}

                <View
                  style={[
                    styles.footerFoodIcon,
                    {
                      top: Math.round(metrics.footerArtHeight * 0.14),
                      left: Math.round(footerArtWidth * 0.08),
                    },
                  ]}
                >
                  <DecorBowlIcon color={DECOR_ORANGE} size={bowlSize} />
                </View>

                <View
                  style={[
                    styles.footerFoodIcon,
                    {
                      top: Math.round(metrics.footerArtHeight * 0.22),
                      left: Math.round((footerArtWidth - cupSize) / 2),
                    },
                  ]}
                >
                  <DecorCupIcon color={DECOR_ORANGE} size={cupSize} />
                </View>

                <View
                  style={[
                    styles.footerFoodIcon,
                    {
                      top: Math.round(metrics.footerArtHeight * 0.16),
                      left: Math.round(footerArtWidth * 0.73),
                    },
                  ]}
                >
                  <DecorLeafIcon color={DECOR_ORANGE} size={leafSize} />
                </View>
              </View>

              <Text
                style={[
                  styles.footerNote,
                  {
                    marginTop: metrics.footerTextTopGap,
                    fontSize: metrics.footerFontSize,
                    lineHeight: metrics.footerLineHeight,
                  },
                ]}
              >
                {"Direcci\u00f3n de Bienestar Universitario \u2022 ULEAM"}
              </Text>
            </View>
          </Animated.View>
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
  screenLayout: {
    flex: 1,
    justifyContent: "space-between",
  },
  mainSection: {
    flex: 1,
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    justifyContent: "center",
  },
  logoBlock: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  logoImage: {
    alignSelf: "center",
    backgroundColor: "transparent",
  },
  textBlock: {
    width: "100%",
    alignItems: "center",
  },
  title: {
    color: TEXT_PRIMARY,
    fontWeight: typography.weights.semiBold,
    textAlign: "center",
    letterSpacing: 0.15,
  },
  subtitle: {
    maxWidth: 308,
    color: TEXT_SECONDARY,
    textAlign: "center",
    fontWeight: typography.weights.regular,
  },
  optionsRow: {
    width: "100%",
    maxWidth: 336,
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  optionCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(231, 225, 218, 0.94)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    shadowColor: "#34241C",
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  optionPressed: {
    opacity: 0.96,
    transform: [{ translateY: 1 }, { scale: 0.988 }],
  },
  optionIconShell: {
    marginBottom: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  studentIconShell: {
    backgroundColor: STUDENT_ICON_BG,
    borderColor: STUDENT_ICON_BORDER,
  },
  communityIconShell: {
    backgroundColor: COMMUNITY_ICON_BG,
    borderColor: COMMUNITY_ICON_BORDER,
  },
  optionTitle: {
    color: TEXT_PRIMARY,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.md,
    textAlign: "center",
  },
  optionSubtitle: {
    marginTop: spacing.xs,
    color: TEXT_SECONDARY,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    textAlign: "center",
  },
  footerSection: {
    width: "100%",
  },
  waveSvg: {
    width: "100%",
  },
  footerPanel: {
    backgroundColor: SURFACE,
    marginTop: -1,
  },
  footerArt: {
    position: "relative",
    width: "100%",
    alignSelf: "center",
  },
  footerAccentIcon: {
    position: "absolute",
  },
  footerFoodIcon: {
    position: "absolute",
  },
  footerNote: {
    width: "100%",
    maxWidth: 312,
    alignSelf: "center",
    color: TEXT_MUTED,
    textAlign: "center",
    opacity: 0.9,
  },
});
