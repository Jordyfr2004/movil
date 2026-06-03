import React, { useMemo, useState } from "react";
import { Alert, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import {
  CreateRestaurantForm,
  CreateRestaurantHeader,
} from "../components/createRestaurant";
import { Screen } from "../components/Screen";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../navigation/routes";
import { RootStackParamList } from "../navigation/types";
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

    if (isSubmitting) {
      return;
    }

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
      <CreateRestaurantHeader />
      <CreateRestaurantForm
        canSubmit={canSubmit}
        isSubmitting={isSubmitting}
        name={name}
        onNameChange={setName}
        onSubmit={handleCreate}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
