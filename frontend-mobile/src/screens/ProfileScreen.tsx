import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { ROUTES } from "../navigation/routes";
import { Screen } from "../components/Screen";
import { AppButton } from "../components/AppButton";
import { mockUser } from "../constants/mockUser";
import { colors, typography } from "../theme";
import { spacing } from "../constants/spacing";

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.Profile>;

export function ProfileScreen({ navigation }: Props) {
  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Mi perfil</Text>
        <Text style={styles.subtitle}>
          Administra tu informacion y sesiones activas.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Nombre</Text>
        <Text style={styles.value}>{mockUser.fullName}</Text>
        <Text style={styles.label}>Correo</Text>
        <Text style={styles.value}>{mockUser.email}</Text>
        <Text style={styles.label}>Rol</Text>
        <Text style={styles.value}>
          {mockUser.role === "student" ? "Estudiante" : "Administrador"}
        </Text>
      </View>

      <View style={styles.footer}>
        <AppButton
          label="Cerrar sesion"
          onPress={() => navigation.replace(ROUTES.Welcome)}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  value: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  footer: {
    marginTop: "auto",
  },
}
);
