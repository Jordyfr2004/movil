import { ComponentProps } from "react";
import { Easing, TextStyle } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export const SCREEN_BACKGROUND = "#F7E5CC";
export const SURFACE = "#FFFFFF";
export const TEXT_PRIMARY = "#2D221B";
export const TEXT_SECONDARY = "#5F5048";
export const TEXT_MUTED = "#8A7B73";
export const DECOR_ORANGE = "rgba(249, 115, 22, 0.28)";
export const DECOR_ORANGE_SOFT = "rgba(249, 115, 22, 0.18)";
export const STUDENT_ICON_BG = "rgba(227, 240, 229, 0.96)";
export const STUDENT_ICON_BORDER = "rgba(98, 130, 105, 0.28)";
export const COMMUNITY_ICON_BG = "rgba(248, 227, 228, 0.96)";
export const COMMUNITY_ICON_BORDER = "rgba(185, 86, 92, 0.28)";
export const WELCOME_LOGO = require("../../assets/images/logo_comedor_uleam_institucional_final.png");
export const ENTRANCE_DURATION = 420;
export const ENTRANCE_OFFSET = 10;
export const ENTRANCE_EASING = Easing.out(Easing.cubic);

type DecorativeIconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

type DecorativeIconStyle = TextStyle & {
  transform?: { rotate: string }[];
};

export type WelcomeLayoutMetrics = {
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

export type DecorativeBackgroundIcon = {
  name: DecorativeIconName;
  size: number;
  color: string;
  style: DecorativeIconStyle;
};

export const decorativeBackgroundIcons: DecorativeBackgroundIcon[] = [
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
];

export const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

export const getWelcomeLayoutMetrics = (
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
