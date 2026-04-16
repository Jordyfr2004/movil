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
          label="Entrar"
          onPress={() => navigation.replace(ROUTES.Home)}
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
