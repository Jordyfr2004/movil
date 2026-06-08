import React from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { spacing } from "../../constants/spacing";
import { typography } from "../../theme";
import { LINK_ORANGE, LoginLayoutMetrics } from "./loginTheme";
import { LoginPasswordInput } from "./LoginPasswordInput";
import { LoginSubmitButton } from "./LoginSubmitButton";
import { LoginTextInput } from "./LoginTextInput";
import { useEntranceAnimation } from "./useEntranceAnimation";

type LoginFormProps = {
  email: string;
  password: string;
  loading: boolean;
  metrics: LoginLayoutMetrics;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onForgotPassword: () => void;
  onSubmit: () => void;
};

export function LoginForm({
  email,
  password,
  loading,
  metrics,
  onEmailChange,
  onPasswordChange,
  onForgotPassword,
  onSubmit,
}: LoginFormProps) {
  const formEntrance = useEntranceAnimation(200);

  return (
    <Animated.View
      style={[
        styles.formSection,
        {
          marginTop: metrics.formTopMargin,
        },
        formEntrance,
      ]}
    >
      <View style={[styles.fieldsGroup, { gap: metrics.fieldGap }]}>
        <LoginTextInput
          value={email}
          onChangeText={onEmailChange}
          placeholder="Correo"
          iconName="email-outline"
          metrics={metrics}
          keyboardType="email-address"
          returnKeyType="next"
          accessibilityLabel="Correo electrónico"
          textContentType="emailAddress"
          autoComplete="email"
        />

        <LoginPasswordInput
          value={password}
          onChangeText={onPasswordChange}
          metrics={metrics}
          onSubmitEditing={onSubmit}
        />
      </View>

      <View style={styles.forgotPasswordRow}>
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

      <LoginSubmitButton
        loading={loading}
        metrics={metrics}
        onPress={onSubmit}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  formSection: {
    width: "100%",
    maxWidth: 392,
    alignSelf: "center",
  },
  fieldsGroup: {
    width: "100%",
  },
  forgotPasswordRow: {
    marginTop: 14,
    alignItems: "flex-end",
  },
  forgotButton: {
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
