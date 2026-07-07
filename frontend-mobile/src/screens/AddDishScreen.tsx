import React, { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Svg, { Path } from "react-native-svg";
import * as ImagePicker from "expo-image-picker";

import { AddDishForm, AddDishHeader } from "../components/addDish";
import { Screen } from "../components/Screen";
import { spacing } from "../constants/spacing";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../navigation/routes";
import { RootStackParamList } from "../navigation/types";
import { createDish, updateDish, DishImageFile } from "../services/dishService";
import { studentPalette } from "../theme/studentPalette";

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
  const [image, setImage] = useState<DishImageFile | null>(null);
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

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permiso requerido", "Debes permitir acceso a la galería.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const uriParts = asset.uri.split(".");
    const extension = uriParts[uriParts.length - 1] || "jpg";

    setImage({
      uri: asset.uri,
      name: `dish-${Date.now()}.${extension}`,
      type: asset.mimeType ?? `image/${extension}`,
    });
  };

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

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      if (isEditMode && dish?.id) {
        await updateDish(accessToken, dish.id, {
          name: trimmedName,
          description: trimmedDescription.length ? trimmedDescription : undefined,
          price: safePrice,
        });

        Alert.alert("Listo", "Plato actualizado correctamente.", [
          { text: "Volver", onPress: () => navigation.goBack() },
        ]);

        return;
      }

      await createDish(accessToken, {
        name: trimmedName,
        description: trimmedDescription.length ? trimmedDescription : undefined,
        price: safePrice,
        is_available: true,
        is_active: true,
        image,
      });

      Alert.alert("Listo", "Plato añadido correctamente.", [
        { text: "Volver", onPress: () => navigation.goBack() },
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
        <AddDishHeader isEditMode={isEditMode} />
        <AddDishForm
          canSubmit={canSubmit}
          description={description}
          imageUri={image?.uri ?? null}
          isEditMode={isEditMode}
          isSubmitting={isSubmitting}
          name={name}
          price={price}
          onDescriptionChange={setDescription}
          onImagePick={handlePickImage}
          onNameChange={setName}
          onPriceChange={(value) => setPrice(normalizePriceInput(value))}
          onSubmit={handleSubmit}
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
