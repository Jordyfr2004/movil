import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import { colors } from "./colors";
import { designSystem } from "./designSystem";
import { typography } from "./typography";

export { colors, designSystem, typography };

export const appThemes = {
  light: {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: designSystem.themes.light.background,
      primary: designSystem.themes.light.primary,
      card: designSystem.themes.light.surface,
      text: designSystem.themes.light.textPrimary,
      border: designSystem.themes.light.border,
      notification: designSystem.themes.light.primary,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: designSystem.themes.dark.background,
      primary: designSystem.themes.dark.primary,
      card: designSystem.themes.dark.surface,
      text: designSystem.themes.dark.textPrimary,
      border: designSystem.themes.dark.border,
      notification: designSystem.themes.dark.primary,
    },
  },
};

export const appTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    primary: colors.primary,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.primary,
  },
};
