import React from "react";
import { StyleSheet, View } from "react-native";

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
  isEditMode: boolean;
  isSubmitting: boolean;
  name: string;
  price: string;
  onDescriptionChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  onSubmit: () => void;
};

export function AddDishForm({
  canSubmit,
  description,
  isEditMode,
  isSubmitting,
  name,
  price,
  onDescriptionChange,
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
});
