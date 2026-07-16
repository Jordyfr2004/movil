import { designSystem } from "./designSystem";

export const colors = {
  background: designSystem.colors.background,
  surface: designSystem.colors.surface,
  surfaceMuted: designSystem.colors.surfaceMuted,
  primary: designSystem.colors.primary,
  primarySoft: designSystem.colors.primarySoft,
  onPrimary: designSystem.colors.textInverted,
  textPrimary: designSystem.colors.textPrimary,
  textSecondary: designSystem.colors.textSecondary,
  textMuted: designSystem.colors.textMuted,
  border: designSystem.colors.border,
  borderStrong: designSystem.colors.borderStrong,
  shadow: designSystem.colors.shadow,
  success: designSystem.colors.success,
  successSoft: designSystem.colors.successSoft,
  error: designSystem.colors.danger,
  errorSoft: designSystem.colors.dangerSoft,
} as const;
