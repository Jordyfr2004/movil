import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { typography } from "../../theme";
import {
  BUTTON_ORANGE,
  LoginLayoutMetrics,
  SURFACE,
} from "./loginTheme";

type LoginSubmitButtonProps = {
  loading: boolean;
  metrics: LoginLayoutMetrics;
  onPress: () => void;
};

export function LoginSubmitButton({
  loading,
  metrics,
  onPress,
}: LoginSubmitButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Iniciar sesión"
      accessibilityState={{ disabled: loading, busy: loading }}
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        styles.primaryButton,
        {
          height: metrics.buttonHeight,
          borderRadius: metrics.buttonRadius,
          marginTop: metrics.buttonTopMargin,
        },
        loading && styles.primaryButtonDisabled,
        pressed && !loading && styles.pressablePressed,
      ]}
    >
      <Text style={styles.primaryButtonLabel}>
        {loading ? "INGRESANDO..." : "INGRESAR"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: BUTTON_ORANGE,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: BUTTON_ORANGE,
    shadowOpacity: 0.24,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 7 },
    elevation: 5,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonLabel: {
    color: SURFACE,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.4,
  },
  pressablePressed: {
    opacity: 0.96,
    transform: [{ scale: 0.985 }],
  },
});
