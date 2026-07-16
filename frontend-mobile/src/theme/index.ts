import { DefaultTheme } from "@react-navigation/native";
import { colors } from "./colors";
import { designSystem } from "./designSystem";
import { typography } from "./typography";

export { colors, designSystem, typography };

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
