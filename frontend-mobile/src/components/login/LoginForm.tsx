import React from "react";
import { Animated, StyleSheet, View } from "react-native";
import { LoginLayoutMetrics } from "./loginTheme";
import { LoginPasswordInput } from "./LoginPasswordInput";
import { LoginSubmitButton } from "./LoginSubmitButton";
import { LoginTextInput } from "./LoginTextInput";
import { RememberMeRow } from "./RememberMeRow";
import { useEntranceAnimation } from "./useEntranceAnimation";

type LoginFormProps = {
  email: string;
  password: string;
  loading: boolean;
  rememberMe: boolean;
  metrics: LoginLayoutMetrics;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onToggleRememberMe: () => void;
  onForgotPassword: () => void;
  onSubmit: () => void;
};

export function LoginForm({
  email,
  password,
  loading,
  rememberMe,
  metrics,
  onEmailChange,
  onPasswordChange,
  onToggleRememberMe,
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

      <RememberMeRow
        rememberMe={rememberMe}
        onToggleRememberMe={onToggleRememberMe}
        onForgotPassword={onForgotPassword}
      />

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
});
