import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { ROUTES } from "../navigation/routes";
import { Screen } from "../components/Screen";
import { AppButton } from "../components/AppButton";
import { StatusBadge } from "../components/StatusBadge";
import { mockUser } from "../constants/mockUser";
import { colors, typography } from "../theme";
import { spacing } from "../constants/spacing";

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.Profile>;

export function ProfileScreen({ navigation }: Props) {
  const initial = mockUser.fullName?.trim()?.charAt(0)?.toUpperCase() ?? "U";

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mi perfil</Text>
        <Text style={styles.subtitle}>
          Información de tu cuenta y acceso rápido a tu sesión.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.profileText}>
            <Text style={styles.name} numberOfLines={1}>
              {mockUser.fullName}
            </Text>
            <Text style={styles.email} numberOfLines={1}>
              {mockUser.email}
            </Text>
          </View>
          <StatusBadge
            label={mockUser.role === "student" ? "Estudiante" : "Administrador"}
            tone="success"
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.field}>
          <Text style={styles.label}>Rol</Text>
          <Text style={styles.value}>
            {mockUser.role === "student" ? "Estudiante" : "Administrador"}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <AppButton
          label="Cerrar sesión"
          onPress={() => navigation.replace(ROUTES.Welcome)}
          variant="danger"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
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
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 1,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  profileText: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeights.md,
  },
  email: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  value: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    fontWeight: typography.weights.semiBold,
  },
  footer: {
    marginTop: "auto",
  },
});
