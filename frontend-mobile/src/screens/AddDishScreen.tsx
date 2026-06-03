import React, { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AddDishForm, AddDishHeader } from "../components/addDish";
import { Screen } from "../components/Screen";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../navigation/routes";
import { RootStackParamList } from "../navigation/types";
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
  const [description, setDescription] = useState(dish?.description ?? "");
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

    return (
      Boolean(accessToken) &&
      name.trim().length > 2 &&
      hasValidPrice &&
      !isSubmitting
    );
  }, [accessToken, name, price, isSubmitting]);

  const handleSubmit = async () => {
    if (!accessToken) {
      Alert.alert("Sesión no disponible", "Vuelve a iniciar sesión.");
      return;
    }

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    const safePrice = normalizePriceInput(price).trim();

    if (trimmedName.length < 3) {
      Alert.alert("Nombre inválido", "Ingresa un nombre de al menos 3 caracteres.");
      return;
    }

    if (!safePrice || Number.isNaN(Number(safePrice))) {
      Alert.alert("Precio inválido", "Ingresa un precio válido.");
      return;
    }

    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);

      if (isEditMode && dish?.id) {
        await updateDish(accessToken, dish.id, {
          name: trimmedName,
          description: trimmedDescription.length ? trimmedDescription : undefined,
          price: safePrice,
        });

        Alert.alert("Listo", "Plato actualizado correctamente.", [
          {
            text: "Volver",
            onPress: () => navigation.goBack(),
          },
        ]);

        return;
      }

      await createDish(accessToken, {
        name: trimmedName,
        description: trimmedDescription.length ? trimmedDescription : undefined,
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
      <AddDishHeader isEditMode={isEditMode} />
      <AddDishForm
        canSubmit={canSubmit}
        description={description}
        isEditMode={isEditMode}
        isSubmitting={isSubmitting}
        name={name}
        price={price}
        onDescriptionChange={setDescription}
        onNameChange={setName}
        onPriceChange={(value) => setPrice(normalizePriceInput(value))}
        onSubmit={handleSubmit}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
