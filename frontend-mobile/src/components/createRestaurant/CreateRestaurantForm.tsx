import React from "react";
import { StyleSheet, View } from "react-native";

import { spacing } from "../../constants/spacing";
import { studentPalette } from "../../theme/studentPalette";
import { Card } from "../Card";
import { StudentSectionHeader } from "../StudentSectionHeader";
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
      <StudentSectionHeader
        iconName="storefront-outline"
        title="Datos del restaurante"
        subtitle="Usa el nombre real que verán los estudiantes."
      />

      <View style={styles.fields}>
        <CreateRestaurantNameField value={name} onChangeText={onNameChange} />
      </View>

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
