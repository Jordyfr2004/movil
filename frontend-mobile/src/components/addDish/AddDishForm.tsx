import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { spacing } from "../../constants/spacing";
import { studentPalette } from "../../theme/studentPalette";
import { Card } from "../Card";
import { StudentSectionHeader } from "../StudentSectionHeader";
import { AddDishDescriptionField } from "./AddDishDescriptionField";
import { AddDishNameField } from "./AddDishNameField";
import { AddDishPriceField } from "./AddDishPriceField";
import { AddDishSubmitButton } from "./AddDishSubmitButton";

type AddDishFormProps = {
  canSubmit: boolean;
  description: string;
  imageUri: string | null;
  isEditMode: boolean;
  isSubmitting: boolean;
  name: string;
  price: string;
  onDescriptionChange: (value: string) => void;
  onImagePick: () => void;
  onNameChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  onSubmit: () => void;
};

export function AddDishForm({
  canSubmit,
  description,
  imageUri,
  isEditMode,
  isSubmitting,
  name,
  price,
  onDescriptionChange,
  onImagePick,
  onNameChange,
  onPriceChange,
  onSubmit,
}: AddDishFormProps) {
  return (
    <Card style={styles.card}>
      <StudentSectionHeader
        iconName="playlist-edit"
        title="Datos del plato"
        subtitle="Completa los campos reales de la carta."
      />

      <View style={styles.fields}>
        {!isEditMode && (
          <View style={styles.imageBlock}>
            <Pressable style={styles.imagePicker} onPress={onImagePick}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
              ) : (
                <Text style={styles.imageText}>Seleccionar imagen del plato</Text>
              )}
            </Pressable>
          </View>
        )}

        <AddDishNameField value={name} onChangeText={onNameChange} />
        <AddDishDescriptionField
          value={description}
          onChangeText={onDescriptionChange}
        />
        <AddDishPriceField value={price} onChangeText={onPriceChange} />
      </View>

      <AddDishSubmitButton
        disabled={!canSubmit}
        isEditMode={isEditMode}
        isSubmitting={isSubmitting}
        onPress={onSubmit}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.lg,
    padding: spacing.md,
    borderRadius: 22,
    borderColor: studentPalette.border,
    backgroundColor: studentPalette.card,
    shadowColor: studentPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  fields: {
    gap: spacing.md,
  },
  imageBlock: {
    gap: spacing.xs,
  },
  imagePicker: {
    height: 150,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: studentPalette.borderStrong,
    backgroundColor: studentPalette.primaryFaint,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  imageText: {
    color: studentPalette.textSecondary,
    fontWeight: "700",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
});
