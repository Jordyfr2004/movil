import { Easing } from "react-native";

export const SCREEN_BACKGROUND = "#F7E5CC";
export const SURFACE = "#FFFFFF";
export const ACCENT_ORANGE = "#F97316";
export const BUTTON_ORANGE = "#FF6A00";
export const LINK_ORANGE = "#EA6B2F";
export const TEXT_PRIMARY = "#2D221B";
export const TEXT_SECONDARY = "#5F5048";
export const TEXT_MUTED = "#8A7B73";
export const INPUT_BORDER = "#F1DCC8";
export const DECOR_ORANGE = "rgba(249, 115, 22, 0.28)";
export const DECOR_ORANGE_SOFT = "rgba(249, 115, 22, 0.20)";
export const ENTRANCE_DURATION = 420;
export const ENTRANCE_OFFSET = 10;
export const ENTRANCE_EASING = Easing.out(Easing.cubic);
export const LOGIN_LOGO = require("../../assets/images/logo_comedor_uleam_institucional_final.png");

export type LoginLayoutMetrics = {
  horizontalPadding: number;
  contentTopPadding: number;
  logoImageSize: number;
  titleTopMargin: number;
  titleSize: number;
  titleLineHeight: number;
  formTopMargin: number;
  fieldGap: number;
  inputHeight: number;
  inputRadius: number;
  buttonHeight: number;
  buttonRadius: number;
  buttonTopMargin: number;
  footerTopMargin: number;
  waveHeight: number;
  footerPanelTopPadding: number;
  footerPanelBottomPadding: number;
  footerArtHeight: number;
  footerArtLift: number;
  footerIconSize: number;
  footerTextGap: number;
  footerPrimaryFontSize: number;
  footerAccentFontSize: number;
};

export const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

export const getLoginLayoutMetrics = (
  width: number,
  height: number,
  bottomInset: number
): LoginLayoutMetrics => {
  const compactHeightProgress = clamp((height - 700) / 220, 0, 1);

  return {
    horizontalPadding: clamp(Math.round(width * 0.06), 22, 28),
    contentTopPadding: clamp(Math.round(height * 0.025), 18, 26),
    logoImageSize: clamp(Math.round(width * 0.395), 148, 168),
    titleTopMargin: clamp(Math.round(width * 0.048), 16, 22),
    titleSize: clamp(Math.round(width * 0.09), 34, 38),
    titleLineHeight: clamp(Math.round(width * 0.1), 40, 44),
    formTopMargin: clamp(Math.round(width * 0.056), 18, 24),
    fieldGap: clamp(Math.round(width * 0.03), 12, 14),
    inputHeight: clamp(Math.round(width * 0.165), 62, 68),
    inputRadius: clamp(Math.round(width * 0.05), 18, 22),
    buttonHeight: clamp(Math.round(width * 0.16), 58, 64),
    buttonRadius: clamp(Math.round(width * 0.04), 16, 18),
    buttonTopMargin: clamp(Math.round(width * 0.038), 12, 16),
    footerTopMargin: clamp(
      Math.round(height * (0.014 + compactHeightProgress * 0.003)),
      10,
      18
    ),
    waveHeight: clamp(Math.round(width * 0.142), 52, 62),
    footerPanelTopPadding: clamp(Math.round(width * 0.006), 0, 3),
    footerPanelBottomPadding: Math.max(bottomInset + 20, 30),
    footerArtHeight: clamp(Math.round(width * 0.225), 78, 92),
    footerArtLift: clamp(Math.round(width * 0.072), 24, 28),
    footerIconSize: clamp(Math.round(width * 0.15), 54, 64),
    footerTextGap: clamp(Math.round(width * 0.02), 6, 8),
    footerPrimaryFontSize: clamp(Math.round(width * 0.036), 15, 16),
    footerAccentFontSize: clamp(Math.round(width * 0.041), 17, 18),
  };
};
