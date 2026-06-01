import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { spacing } from "../../constants/spacing";
import { typography } from "../../theme";
import {
  ACCENT_ORANGE,
  LINK_ORANGE,
  SURFACE,
  TEXT_SECONDARY,
} from "./loginTheme";

type RememberMeRowProps = {
  rememberMe: boolean;
  onToggleRememberMe: () => void;
  onForgotPassword: () => void;
};

export function RememberMeRow({
  rememberMe,
  onToggleRememberMe,
  onForgotPassword,
}: RememberMeRowProps) {
  return (
    <View style={styles.optionsRow}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel="Recordarme"
        accessibilityState={{ checked: rememberMe }}
        onPress={onToggleRememberMe}
        style={({ pressed }) => [
          styles.rememberButton,
          pressed && styles.pressablePressed,
        ]}
      >
        <View
          style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
        >
          {rememberMe ? (
            <MaterialCommunityIcons
              name="check"
              size={14}
              color="#FFFFFF"
              accessible={false}
            />
          ) : null}
        </View>
        <Text style={styles.rememberText}>Recordarme</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Olvidé mi contraseña"
        onPress={onForgotPassword}
        style={({ pressed }) => [
          styles.forgotButton,
          pressed && styles.pressablePressed,
        ]}
      >
        <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  optionsRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  rememberButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexShrink: 0,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: "#D9C6B8",
    backgroundColor: SURFACE,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: ACCENT_ORANGE,
    borderColor: ACCENT_ORANGE,
  },
  rememberText: {
    color: TEXT_SECONDARY,
    fontSize: typography.sizes.sm,
    lineHeight: 20,
  },
  forgotButton: {
    flex: 1,
    paddingVertical: spacing.xs,
  },
  forgotText: {
    color: LINK_ORANGE,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: typography.weights.semiBold,
    textAlign: "right",
  },
  pressablePressed: {
    opacity: 0.96,
    transform: [{ scale: 0.985 }],
  },
});
