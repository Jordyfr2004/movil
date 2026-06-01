import React, { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";
import { ACCENT_ORANGE, LoginLayoutMetrics } from "./loginTheme";
import { LoginTextInput } from "./LoginTextInput";

type LoginPasswordInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  metrics: LoginLayoutMetrics;
  onSubmitEditing?: () => void;
};

export function LoginPasswordInput({
  value,
  onChangeText,
  metrics,
  onSubmitEditing,
}: LoginPasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <LoginTextInput
      value={value}
      onChangeText={onChangeText}
      placeholder="Contraseña"
      iconName="lock-outline"
      metrics={metrics}
      secureTextEntry={!showPassword}
      returnKeyType="done"
      onSubmitEditing={onSubmitEditing}
      accessibilityLabel="Contraseña"
      textContentType="password"
      autoComplete="current-password"
      trailingAccessory={
        <PasswordVisibilityButton
          showPassword={showPassword}
          onPress={() => setShowPassword((current) => !current)}
        />
      }
    />
  );
}

type PasswordVisibilityButtonProps = {
  showPassword: boolean;
  onPress: () => void;
};

function PasswordVisibilityButton({
  showPassword,
  onPress,
}: PasswordVisibilityButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
      }
      onPress={onPress}
      style={({ pressed }) => [
        styles.trailingIconButton,
        pressed && styles.pressablePressed,
      ]}
    >
      <MaterialCommunityIcons
        name={showPassword ? "eye-off-outline" : "eye-outline"}
        size={24}
        color={ACCENT_ORANGE}
        accessible={false}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  trailingIconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  pressablePressed: {
    opacity: 0.96,
    transform: [{ scale: 0.985 }],
  },
});
