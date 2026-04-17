import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { ROUTES } from "../navigation/routes";
import { Screen } from "../components/Screen";
import { AppInput } from "../components/AppInput";
import { AppButton } from "../components/AppButton";
import { colors, typography } from "../theme";
import { spacing } from "../constants/spacing";

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.Login>;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inicia sesión</Text>
        <Text style={styles.subtitle}>
          Accede con tu correo institucional o personal para gestionar tus reservas.
        </Text>
      </View>

      <View style={styles.card}>
        <AppInput
          label="Correo"
          value={email}
          onChangeText={setEmail}
          placeholder="nombre@uleam.edu.ec"
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
            label="Entrar"
            onPress={() => navigation.replace(ROUTES.Home)}
          />
        </View>
      </View>

      <Text style={styles.helperText}>
        Si tienes problemas para acceder, verifica que el correo esté escrito correctamente.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeights.xl,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.md,
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
  },
});
