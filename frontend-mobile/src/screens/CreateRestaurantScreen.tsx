import React, { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Svg, { Path } from "react-native-svg";

import {
  CreateRestaurantForm,
  CreateRestaurantHeader,
} from "../components/createRestaurant";
import { Screen } from "../components/Screen";
import { spacing } from "../constants/spacing";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../navigation/routes";
import { RootStackParamList } from "../navigation/types";
import { createRestaurant } from "../services/restaurantService";
import { studentPalette } from "../theme/studentPalette";

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
      <View
        style={styles.backgroundDecor}
        pointerEvents="none"
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Svg
          width="100%"
          height={120}
          viewBox="0 0 360 120"
          preserveAspectRatio="none"
          style={styles.backgroundWave}
        >
          <Path
            d="M0 0 H360 V62 C292 88 229 36 158 58 C91 80 43 84 0 66 Z"
            fill={studentPalette.backgroundStrong}
          />
        </Svg>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <CreateRestaurantHeader />
        <CreateRestaurantForm
          canSubmit={canSubmit}
          isSubmitting={isSubmitting}
          name={name}
          onNameChange={setName}
          onSubmit={handleCreate}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: studentPalette.background,
  },
  backgroundDecor: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  backgroundWave: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
});
