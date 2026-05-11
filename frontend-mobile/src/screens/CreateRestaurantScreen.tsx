import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Screen } from "../components/Screen";
import { AppInput } from "../components/AppInput";
import { AppButton } from "../components/AppButton";
import { colors, typography } from "../theme";
import { spacing } from "../constants/spacing";
import { RootStackParamList } from "../navigation/types";
import { ROUTES } from "../navigation/routes";
import { useAuth } from "../context/AuthContex";
import { createRestaurant } from "../services/restaurantService";

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.CreateRestaurant
>;

export function CreateRestaurantScreen({ navigation }: Props) {
  const { accessToken } = useAuth();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return Boolean(accessToken) && name.trim().length > 2 && !isSubmitting;
  }, [accessToken, name, isSubmitting]);

  const handleCreate = async () => {
    if (!accessToken) {
      Alert.alert("Sesión no disponible", "Vuelve a iniciar sesión.");
      return;
    }

    const trimmedName = name.trim();
    if (trimmedName.length < 3) {
      Alert.alert("Nombre inválido", "Ingresa un nombre de al menos 3 caracteres.");
      return;
    }

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await createRestaurant(accessToken, { name: trimmedName, is_active: true });

      Alert.alert(
        "Listo",
        "Restaurante creado correctamente.",
        [
          {
            text: "Continuar",
            onPress: () =>
              navigation.reset({
                index: 0,
                routes: [{ name: ROUTES.ManagerProfile }],
              }),
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo crear el restaurante";
      Alert.alert("Error", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Crea tu restaurante</Text>
        <Text style={styles.subtitle}>
          Como manager, necesitas registrar tu restaurante una sola vez para que
          sea visible a los estudiantes.
        </Text>
      </View>

      <View style={styles.card}>
        <AppInput
          label="Nombre del restaurante"
          value={name}
          onChangeText={setName}
          placeholder="Ej: Comedor Central"
          autoCapitalize="words"
        />

        <View style={styles.actions}>
          <AppButton
            label={isSubmitting ? "Creando…" : "Crear restaurante"}
            onPress={handleCreate}
            disabled={!canSubmit}
          />
        </View>
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
    gap: spacing.lg,
  },
  actions: {
    gap: spacing.sm,
  },
});
