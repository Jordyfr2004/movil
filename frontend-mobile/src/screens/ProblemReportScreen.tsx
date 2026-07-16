import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { AppButton, Screen } from "../components";
import { spacing } from "../constants/spacing";
import { ProblemType, useLocalFeedback } from "../context/LocalFeedbackContext";
import { ROUTES } from "../navigation/routes";
import { StudentStackParamList } from "../navigation/types";
import { designSystem, typography } from "../theme";
import { studentPalette } from "../theme/studentPalette";

type Props = NativeStackScreenProps<
  StudentStackParamList,
  typeof ROUTES.ProblemReport
>;

const REPORT_TYPES: Array<{ value: ProblemType; label: string }> = [
  { value: "missing_product", label: "Producto faltante" },
  { value: "wrong_product", label: "Producto incorrecto" },
  { value: "wrong_charge", label: "Cobro incorrecto" },
  { value: "payment_problem", label: "Problema con pago" },
  { value: "long_wait", label: "Mucha espera" },
  { value: "other", label: "Otro" },
];

export function ProblemReportScreen({ navigation, route }: Props) {
  const { addReport } = useLocalFeedback();
  const [type, setType] = useState<ProblemType>("missing_product");
  const [comment, setComment] = useState("");
  const reservationId = route.params?.reservationId;

  const submit = () => {
    addReport({
      reservationId,
      type,
      comment: comment.trim() || undefined,
    });
    navigation.goBack();
  };

  return (
    <Screen style={styles.container}>
      <Text style={styles.title}>Reportar problema</Text>
      <Text style={styles.subtitle}>
        Se guardará como pendiente local hasta que exista un endpoint real.
      </Text>

      <View style={styles.options}>
        {REPORT_TYPES.map((item) => {
          const selected = item.value === type;
          return (
            <Pressable
              key={item.value}
              onPress={() => setType(item.value)}
              style={[styles.option, selected && styles.optionSelected]}
            >
              <Text style={styles.optionText}>{item.label}</Text>
              {selected ? (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={designSystem.iconSizes.md}
                  color={designSystem.colors.primary}
                />
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <TextInput
        value={comment}
        onChangeText={(text) => setComment(text.slice(0, 260))}
        placeholder="Comentario opcional"
        placeholderTextColor={designSystem.colors.textMuted}
        multiline
        style={styles.input}
        textAlignVertical="top"
      />

      <AppButton label="Guardar reporte pendiente" onPress={submit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: studentPalette.background },
  title: {
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    marginTop: spacing.xs,
    color: designSystem.colors.textSecondary,
    fontSize: typography.sizes.sm,
  },
  options: { gap: spacing.sm, marginTop: spacing.lg },
  option: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: designSystem.colors.surface,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
  },
  optionSelected: {
    borderColor: designSystem.colors.primarySoft,
    backgroundColor: designSystem.colors.primaryFaint,
  },
  optionText: {
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  input: {
    minHeight: 104,
    marginVertical: spacing.lg,
    padding: spacing.md,
    borderRadius: 18,
    backgroundColor: designSystem.colors.surface,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
    color: designSystem.colors.textPrimary,
  },
});
