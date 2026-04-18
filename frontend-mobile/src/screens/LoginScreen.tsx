import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { ROUTES } from "../navigation/routes";
import { Screen } from "../components/Screen";
import { AppInput } from "../components/AppInput";
import { AppButton } from "../components/AppButton";
import { colors, typography } from "../theme";
import { spacing } from "../constants/spacing";
import { loginRequest } from "../services/authServices";

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.Login>;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (!normalizedEmail) {
      Alert.alert("Validación", "Debes ingresar tu correo");
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      Alert.alert("Validación", "Ingresa un correo válido");
      return;
    }

    if (!normalizedPassword) {
      Alert.alert("Validación", "Debes ingresar tu contraseña");
      return;
    }

    try {
      setLoading(true);

      const result = await loginRequest({
        email: normalizedEmail,
        password: normalizedPassword,
      });

      const token =
        result.access_token ||
        result.data?.access_token ||
        result.data?.data?.access_token;

      if (!token) {
        Alert.alert(
          "Error",
          "El servidor respondió correctamente, pero no devolvió el token"
        );
        return;
      }

      Alert.alert("Éxito", "Inicio de sesión correcto");
      navigation.replace(ROUTES.Home);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al iniciar sesión";

      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.brandBlock}>
        <View style={styles.mark}>
          <Text style={styles.markText}>U</Text>
        </View>
        <Text style={styles.brandTitle}>Comedor ULEAM</Text>
        <Text style={styles.brandSubtitle}>Acceso seguro</Text>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>Inicia sesión</Text>
        <Text style={styles.subtitle}>
          Accede con tu correo y contraseña para continuar.
        </Text>
      </View>

      <View style={styles.card}>
        <AppInput
          label="Correo"
          value={email}
          onChangeText={setEmail}
          placeholder="correo@dominio.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <AppInput
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
        />

        <View style={styles.actions}>
          <AppButton
            label={loading ? "Ingresando..." : "Entrar"}
            onPress={handleLogin}
            disabled={loading}
          />
        </View>
      </View>

      <Text style={styles.helperText}>
        Si necesitas ayuda, contacta a Bienestar Universitario.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  brandBlock: {
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  mark: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  markText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xl + 2,
    fontWeight: typography.weights.bold,
    letterSpacing: 1,
  },
  brandTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeights.lg,
    textAlign: "center",
  },
  brandSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.sm,
    textAlign: "center",
  },
  header: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
    alignItems: "center",
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeights.xl,
    textAlign: "center",
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.md,
    textAlign: "center",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.lg,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 1,
  },
  actions: {
    marginTop: spacing.sm,
  },
  helperText: {
    marginTop: spacing.lg,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    lineHeight: typography.lineHeights.sm,
    textAlign: "center",
  },
});
