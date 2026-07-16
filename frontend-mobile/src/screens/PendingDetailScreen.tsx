import React, { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
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
  typeof ROUTES.PendingDetail
>;

const REPORT_LABELS: Record<ProblemType, string> = {
  missing_product: "Producto faltante",
  wrong_product: "Producto incorrecto",
  wrong_charge: "Cobro incorrecto",
  payment_problem: "Problema con pago",
  long_wait: "Mucha espera",
  other: "Otro",
};

const TAGS = ["Buen sabor", "Rápido", "Pedido correcto", "Mucha espera"];

export function PendingDetailScreen({ navigation, route }: Props) {
  const {
    deleteRating,
    deleteReport,
    ratings,
    reports,
    updateRating,
    updateReport,
  } = useLocalFeedback();
  const isRating = route.params.kind === "rating";
  const rating = ratings.find((item) => item.id === route.params.id);
  const report = reports.find((item) => item.id === route.params.id);
  const [stars, setStars] = useState(rating?.stars ?? 5);
  const [tags, setTags] = useState<string[]>(rating?.tags ?? []);
  const [comment, setComment] = useState(rating?.comment ?? report?.comment ?? "");

  const title = useMemo(() => {
    if (isRating) return "Detalle de calificación";
    return "Detalle de reporte";
  }, [isRating]);

  if ((isRating && !rating) || (!isRating && !report)) {
    return (
      <Screen style={styles.container}>
        <Text style={styles.title}>Elemento no disponible</Text>
        <AppButton label="Volver" onPress={() => navigation.goBack()} />
      </Screen>
    );
  }

  const save = () => {
    if (isRating && rating) {
      updateRating(rating.id, {
        stars,
        tags,
        comment: comment.trim() || undefined,
      });
    } else if (report) {
      updateReport(report.id, {
        comment: comment.trim() || undefined,
      });
    }
    navigation.goBack();
  };

  const remove = () => {
    Alert.alert("Eliminar elemento", "Se eliminará solo de este dispositivo.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => {
          if (isRating && rating) deleteRating(rating.id);
          if (!isRating && report) deleteReport(report.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <Screen style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>
        {isRating
          ? `Reserva #${rating?.reservationId.slice(0, 8)}`
          : report
            ? REPORT_LABELS[report.type]
            : ""}
      </Text>

      {isRating ? (
        <>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((value) => (
              <Pressable key={value} onPress={() => setStars(value)} hitSlop={8}>
                <MaterialCommunityIcons
                  name={value <= stars ? "star" : "star-outline"}
                  size={32}
                  color={designSystem.colors.primary}
                />
              </Pressable>
            ))}
          </View>
          <View style={styles.tags}>
            {TAGS.map((tag) => {
              const selected = tags.includes(tag);
              return (
                <Pressable
                  key={tag}
                  onPress={() =>
                    setTags((current) =>
                      selected
                        ? current.filter((item) => item !== tag)
                        : [...current, tag]
                    )
                  }
                  style={[styles.tag, selected && styles.tagSelected]}
                >
                  <Text
                    style={[styles.tagText, selected && styles.tagTextSelected]}
                  >
                    {tag}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}

      <TextInput
        value={comment}
        onChangeText={(text) => setComment(text.slice(0, 260))}
        placeholder="Comentario opcional"
        placeholderTextColor={designSystem.colors.textMuted}
        multiline
        style={styles.input}
        textAlignVertical="top"
      />

      <View style={styles.actions}>
        <AppButton label="Guardar cambios" onPress={save} />
        <AppButton label="Eliminar" onPress={remove} variant="secondary" />
      </View>
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
  stars: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xl },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    backgroundColor: designSystem.colors.surface,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
  },
  tagSelected: {
    backgroundColor: designSystem.colors.primaryFaint,
    borderColor: designSystem.colors.primarySoft,
  },
  tagText: {
    color: designSystem.colors.textSecondary,
    fontWeight: typography.weights.bold,
  },
  tagTextSelected: { color: designSystem.colors.primary },
  input: {
    minHeight: 120,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: 18,
    backgroundColor: designSystem.colors.surface,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
    color: designSystem.colors.textPrimary,
  },
  actions: { gap: spacing.sm, marginTop: spacing.lg },
});
