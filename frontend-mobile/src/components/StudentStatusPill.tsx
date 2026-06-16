import React from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { spacing } from "../constants/spacing";
import { typography } from "../theme";
import { studentPalette } from "../theme/studentPalette";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

export type StudentStatusTone =
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "neutral"
  | "primary";

type StudentStatusPillProps = {
  label: string;
  tone?: StudentStatusTone;
  iconName?: IconName;
  size?: "sm" | "md";
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function StudentStatusPill({
  label,
  tone = "neutral",
  iconName,
  size = "sm",
  style,
  textStyle,
}: StudentStatusPillProps) {
  const toneStyles = getToneStyles(tone);

  return (
    <View
      style={[
        styles.pill,
        size === "md" && styles.pillMd,
        toneStyles.container,
        style,
      ]}
    >
      {iconName ? (
        <MaterialCommunityIcons
          name={iconName}
          size={size === "md" ? 15 : 12}
          color={toneStyles.text.color}
        />
      ) : (
        <View style={[styles.dot, toneStyles.dot]} />
      )}
      <Text
        style={[
          styles.text,
          size === "md" && styles.textMd,
          toneStyles.text,
          textStyle,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

function getToneStyles(tone: StudentStatusTone) {
  switch (tone) {
    case "success":
      return {
        container: styles.success,
        text: styles.textSuccess,
        dot: styles.dotSuccess,
      };
    case "danger":
      return {
        container: styles.danger,
        text: styles.textDanger,
        dot: styles.dotDanger,
      };
    case "warning":
      return {
        container: styles.warning,
        text: styles.textWarning,
        dot: styles.dotWarning,
      };
    case "info":
      return {
        container: styles.info,
        text: styles.textInfo,
        dot: styles.dotInfo,
      };
    case "primary":
      return {
        container: styles.primary,
        text: styles.textPrimaryTone,
        dot: styles.dotPrimary,
      };
    case "neutral":
    default:
      return {
        container: styles.neutral,
        text: styles.textNeutral,
        dot: styles.dotNeutral,
      };
  }
}

const styles = StyleSheet.create({
  pill: {
    maxWidth: "100%",
    minHeight: 24,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  pillMd: {
    minHeight: 30,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 999,
  },
  text: {
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    fontWeight: typography.weights.semiBold,
  },
  textMd: {
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
  },
  success: {
    backgroundColor: studentPalette.successSoft,
    borderColor: studentPalette.successBorder,
  },
  danger: {
    backgroundColor: studentPalette.dangerSoft,
    borderColor: studentPalette.dangerBorder,
  },
  warning: {
    backgroundColor: studentPalette.warningSoft,
    borderColor: studentPalette.warningBorder,
  },
  info: {
    backgroundColor: studentPalette.infoSoft,
    borderColor: studentPalette.infoBorder,
  },
  neutral: {
    backgroundColor: studentPalette.neutralSoft,
    borderColor: studentPalette.neutralBorder,
  },
  primary: {
    backgroundColor: studentPalette.primaryPale,
    borderColor: studentPalette.primarySoft,
  },
  textSuccess: {
    color: studentPalette.success,
  },
  textDanger: {
    color: studentPalette.danger,
  },
  textWarning: {
    color: studentPalette.warning,
  },
  textInfo: {
    color: studentPalette.info,
  },
  textNeutral: {
    color: studentPalette.neutral,
  },
  textPrimaryTone: {
    color: studentPalette.primary,
  },
  dotSuccess: {
    backgroundColor: studentPalette.success,
  },
  dotDanger: {
    backgroundColor: studentPalette.danger,
  },
  dotWarning: {
    backgroundColor: studentPalette.warning,
  },
  dotInfo: {
    backgroundColor: studentPalette.info,
  },
  dotNeutral: {
    backgroundColor: studentPalette.neutral,
  },
  dotPrimary: {
    backgroundColor: studentPalette.primary,
  },
});
