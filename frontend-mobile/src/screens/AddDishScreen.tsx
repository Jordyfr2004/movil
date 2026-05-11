import React, { useEffect, useMemo, useState } from "react";
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
import { createDish, updateDish } from "../services/dishService";

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.AddDish>;

function normalizePriceInput(value: string) {
  return value.replace(/[^0-9.]/g, "");
}

export function AddDishScreen({ navigation, route }: Props) {
  const { accessToken } = useAuth();
  const dish = route.params?.dish;
  const isEditMode = Boolean(dish?.id);

  const [name, setName] = useState(dish?.name ?? "");
  const [price, setPrice] = useState(dish?.price ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: isEditMode ? "Editar plato" : "Añadir plato",
    });
  }, [navigation, isEditMode]);

  const canSubmit = useMemo(() => {
    const safePrice = normalizePriceInput(price).trim();
    const hasValidPrice = safePrice.length > 0 && !Number.isNaN(Number(safePrice));

    return Boolean(accessToken) && name.trim().length > 2 && hasValidPrice && !isSubmitting;
  }, [accessToken, name, price, isSubmitting]);

  const handleSubmit = async () => {
    if (!accessToken) {
      Alert.alert("Sesión no disponible", "Vuelve a iniciar sesión.");
      return;
    }

    const trimmedName = name.trim();
    const safePrice = normalizePriceInput(price).trim();

    if (trimmedName.length < 3) {
      Alert.alert("Nombre inválido", "Ingresa un nombre de al menos 3 caracteres.");
      return;
    }

    if (!safePrice || Number.isNaN(Number(safePrice))) {
      Alert.alert("Precio inválido", "Ingresa un precio válido.");
      return;
    }

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      if (isEditMode && dish?.id) {
        await updateDish(accessToken, dish.id, {
          name: trimmedName,
          price: safePrice,
        });

        Alert.alert("Listo", "Plato actualizado correctamente.", [
          {
            text: "Volver",
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        await createDish(accessToken, {
          name: trimmedName,
          price: safePrice,
          is_available: true,
          is_active: true,
        });

        Alert.alert("Listo", "Plato añadido correctamente.", [
          {
            text: "Volver",
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : isEditMode
            ? "No se pudo actualizar el plato"
            : "No se pudo añadir el plato";
      Alert.alert("Error", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{isEditMode ? "Editar plato" : "Añadir plato"}</Text>
        <Text style={styles.subtitle}>
          {isEditMode
            ? "Actualiza la información del plato."
            : "Agrega un plato para que los estudiantes lo vean en tu restaurante."}
        </Text>
      </View>

      <View style={styles.card}>
        <AppInput
          label="Nombre"
          value={name}
          onChangeText={setName}
          placeholder="Ej: Arroz con pollo"
          autoCapitalize="words"
        />

        <AppInput
          label="Precio"
          value={price}
          onChangeText={(value) => setPrice(normalizePriceInput(value))}
          placeholder="Ej: 2.50"
          keyboardType="numeric"
          autoCapitalize="none"
        />

        <View style={styles.actions}>
          <AppButton
            label={
              isSubmitting
                ? "Guardando…"
                : isEditMode
                  ? "Guardar cambios"
                  : "Guardar plato"
            }
            onPress={handleSubmit}
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
