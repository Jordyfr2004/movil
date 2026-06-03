import React from "react";
import { StyleSheet } from "react-native";

import { spacing } from "../../constants/spacing";
import { Card } from "../Card";
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
      <AddDishNameField value={name} onChangeText={onNameChange} />
      <AddDishDescriptionField
        value={description}
        onChangeText={onDescriptionChange}
      />
      <AddDishPriceField value={price} onChangeText={onPriceChange} />
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
  },
});
