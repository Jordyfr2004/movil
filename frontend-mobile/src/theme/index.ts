import { DefaultTheme } from "@react-navigation/native";
import { colors } from "./colors";
import { typography } from "./typography";

export { colors, typography };

export const appTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    primary: colors.primary,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
  },
};
