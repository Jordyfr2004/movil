import { ComponentProps } from "react";
import { Easing, ViewStyle } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { spacing } from "../../constants/spacing";
import { typography } from "../../theme";

export const SCREEN_BACKGROUND = "#F7E5CC";
export const AUTH_BUTTON_BACKGROUND = "rgba(255, 255, 255, 0.92)";
export const AUTH_BUTTON_BORDER = "rgba(231, 225, 218, 0.96)";
export const ENTRANCE_DURATION = 420;
export const ENTRANCE_OFFSET = 10;
export const ENTRANCE_EASING = Easing.out(Easing.cubic);

type DecorativeIconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

export type StudentAccessLayoutMetrics = {
  isCompact: boolean;
  backgroundScale: number;
  layoutHorizontalPadding: number;
  centerContentTopPadding: number;
  isotypeSize: number;
  isotypeRadius: number;
  isotypeTextSize: number;
  titleMarginTop: number;
  titleSize: number;
  titleLineHeight: number;
  supportingMaxWidth: number;
  actionsGap: number;
  actionsTopMargin: number;
  actionsMaxWidth: number;
  authButtonMinHeight: number;
  authButtonRadius: number;
  authButtonHorizontalPadding: number;
  authButtonContentMinHeight: number;
  iconSlotWidth: number;
  footerPaddingTop: number;
  footerPaddingHorizontal: number;
  footerPaddingBottom: number;
  footerFontSize: number;
  footerLineHeight: number;
};

export type DecorativeBackgroundIcon = {
  name: DecorativeIconName;
  size: number;
  color: string;
  style: ViewStyle;
};

export const decorativeBackgroundIcons: DecorativeBackgroundIcon[] = [
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
];

export const getStudentAccessLayoutMetrics = (
  width: number,
  height: number,
  bottomInset: number
): StudentAccessLayoutMetrics => {
  const isCompact = height < 760 || width < 360;

  return {
    isCompact,
    backgroundScale: isCompact ? 0.9 : 1,
    layoutHorizontalPadding: spacing.lg,
    centerContentTopPadding: spacing.md,
    isotypeSize: isCompact ? 78 : 86,
    isotypeRadius: isCompact ? 24 : 28,
    isotypeTextSize: isCompact ? 34 : 39,
    titleMarginTop: isCompact ? spacing.md : spacing.lg,
    titleSize: isCompact ? 30 : typography.sizes.xxl,
    titleLineHeight: isCompact ? 36 : typography.lineHeights.xxl,
    supportingMaxWidth: isCompact ? 252 : 280,
    actionsGap: spacing.md,
    actionsTopMargin: isCompact ? spacing.xl : spacing.xxl,
    actionsMaxWidth: 356,
    authButtonMinHeight: isCompact ? 58 : 62,
    authButtonRadius: 18,
    authButtonHorizontalPadding: spacing.lg,
    authButtonContentMinHeight: isCompact ? 58 : 62,
    iconSlotWidth: 24,
    footerPaddingTop: spacing.md,
    footerPaddingHorizontal: spacing.md,
    footerPaddingBottom: Math.max(bottomInset, spacing.md),
    footerFontSize: typography.sizes.xs,
    footerLineHeight: typography.lineHeights.xs,
  };
};
