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

  const handleLogin = async () => {
    try {
      if (!email.trim() || !password.trim()) {
        Alert.alert("Validacion", "Debes ingresar correo y contrasena");
        return;
      }

      setLoading(true);

      const result = await loginRequest({
        email: email.trim(),
        password: password.trim(),
      });

      const token = result.access_token || result.data?.access_token;

      console.log("LOGIN RESPONSE:", result);
      console.log("TOKEN:", token);

      Alert.alert("Exito", "Inicio de sesion correcto");
      navigation.replace(ROUTES.Home);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al iniciar sesion";

      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Inicia sesion</Text>
        <Text style={styles.subtitle}>
          Accede con tu correo institucional o personal.
        </Text>
      </View>

      <View style={styles.form}>
        <AppInput
          label="Correo"
          value={email}
          onChangeText={setEmail}
          placeholder="nombre@uleam.edu.ec"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <AppInput
          label="Contrasena"
          value={password}
          onChangeText={setPassword}
          placeholder="********"
          secureTextEntry
        />

        <AppButton
          label={loading ? "Ingresando..." : "Entrar"}
          onPress={handleLogin}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  form: {
    gap: spacing.md,
  },
});