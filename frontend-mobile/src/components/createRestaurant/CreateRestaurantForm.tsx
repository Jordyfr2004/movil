import React from "react";
import { StyleSheet } from "react-native";

import { spacing } from "../../constants/spacing";
import { Card } from "../Card";
import { CreateRestaurantNameField } from "./CreateRestaurantNameField";
import { CreateRestaurantSubmitButton } from "./CreateRestaurantSubmitButton";

type CreateRestaurantFormProps = {
  canSubmit: boolean;
  isSubmitting: boolean;
  name: string;
  onNameChange: (value: string) => void;
  onSubmit: () => void;
};

export function CreateRestaurantForm({
  canSubmit,
  isSubmitting,
  name,
  onNameChange,
  onSubmit,
}: CreateRestaurantFormProps) {
  return (
    <Card style={styles.card}>
      <CreateRestaurantNameField value={name} onChangeText={onNameChange} />
      <CreateRestaurantSubmitButton
        disabled={!canSubmit}
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
