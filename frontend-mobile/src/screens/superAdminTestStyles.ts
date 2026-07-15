import { StyleSheet } from "react-native";

import { spacing } from "../constants/spacing";
import { studentPalette } from "../theme/studentPalette";

export const superAdminTestStyles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        studentPalette.background,
    },
    content: {
      padding: spacing.md,
      paddingBottom: spacing.xxl,
      gap: spacing.md,
    },
    title: {
      fontSize: 24,
      fontWeight: "800",
      color:
        studentPalette.textPrimary,
    },
    subtitle: {
      color:
        studentPalette.textSecondary,
      marginBottom: spacing.sm,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "800",
      color:
        studentPalette.textPrimary,
    },
    card: {
      padding: spacing.md,
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        studentPalette.border,
      backgroundColor:
        studentPalette.card,
      gap: spacing.sm,
    },
    selectedCard: {
      borderWidth: 2,
      borderColor:
        studentPalette.primary,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "800",
      color:
        studentPalette.textPrimary,
    },
    detail: {
      color:
        studentPalette.textSecondary,
    },
    identifier: {
      fontSize: 11,
      color:
        studentPalette.textSecondary,
    },
    input: {
      borderWidth: 1,
      borderColor:
        studentPalette.border,
      borderRadius: 12,
      padding: spacing.md,
      color:
        studentPalette.textPrimary,
      backgroundColor:
        studentPalette.card,
    },
    button: {
      padding: spacing.md,
      borderRadius: 12,
      alignItems: "center",
      backgroundColor:
        studentPalette.primary,
    },
    buttonText: {
      color: "#FFFFFF",
      fontWeight: "700",
    },
    secondaryButton: {
      padding: spacing.md,
      borderRadius: 12,
      alignItems: "center",
      borderWidth: 1,
      borderColor:
        studentPalette.primary,
    },
    secondaryButtonText: {
      color:
        studentPalette.primary,
      fontWeight: "700",
    },
    dangerButton: {
      padding: spacing.md,
      borderRadius: 12,
      alignItems: "center",
      backgroundColor: "#B91C1C",
    },
    successButton: {
      padding: spacing.md,
      borderRadius: 12,
      alignItems: "center",
      backgroundColor: "#15803D",
    },
    row: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    flexButton: {
      flex: 1,
    },
    label: {
      fontWeight: "700",
      color:
        studentPalette.textPrimary,
    },
    loading: {
      marginTop: spacing.xl,
    },
    empty: {
      textAlign: "center",
      color:
        studentPalette.textSecondary,
      marginTop: spacing.xl,
    },
    disabled: {
      opacity: 0.5,
    },
  });