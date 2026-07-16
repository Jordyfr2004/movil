import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { AppButton, Screen } from "../components";
import { spacing } from "../constants/spacing";
import { useLocalFeedback } from "../context/LocalFeedbackContext";
import { ROUTES } from "../navigation/routes";
import { StudentStackParamList } from "../navigation/types";
import { designSystem, typography } from "../theme";
import { studentPalette } from "../theme/studentPalette";

type Props = NativeStackScreenProps<
  StudentStackParamList,
  typeof ROUTES.Rating
>;

const TAGS = ["Buen sabor", "Rápido", "Pedido correcto", "Mucha espera"];

export function RatingScreen({ navigation, route }: Props) {
  const { reservation } = route.params;
  const { addRating, hasRatingForReservation } = useLocalFeedback();
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const alreadyRated = hasRatingForReservation(reservation.id);
  const title = useMemo(() => `Reserva #${reservation.id.slice(0, 8)}`, [reservation.id]);

  const submit = () => {
    addRating({
      reservationId: reservation.id,
      stars,
      comment: comment.trim() || undefined,
      tags,
    });
    navigation.goBack();
  };

  return (
    <Screen style={styles.container}>
      <Text style={styles.title}>Calificar experiencia</Text>
      <Text style={styles.subtitle}>
        {alreadyRated
          ? "Esta reserva ya tiene una calificación guardada. Puedes reemplazarla."
          : title}
      </Text>

      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((value) => (
          <Pressable key={value} onPress={() => setStars(value)} hitSlop={8}>
            <MaterialCommunityIcons
              name={value <= stars ? "star" : "star-outline"}
              size={34}
              color={designSystem.colors.primary}
            />
          </Pressable>
        ))}
      </View>

      <View style={styles.tagRow}>
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
              <Text style={[styles.tagText, selected && styles.tagTextSelected]}>
                {tag}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <TextInput
        value={comment}
        onChangeText={(text) => setComment(text.slice(0, 220))}
        placeholder="Comentario opcional"
        placeholderTextColor={designSystem.colors.textMuted}
        accessibilityLabel="Comentario opcional"
        accessibilityHint="Puedes agregar detalles sobre tu experiencia"
        multiline
        style={styles.input}
        textAlignVertical="top"
      />

      <Text style={styles.localNote}>
        Se guardará en este dispositivo y aparecerá en Pendientes.
      </Text>

      <AppButton label="Guardar calificación" onPress={submit} />
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
  stars: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
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
    minHeight: 118,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: 18,
    backgroundColor: designSystem.colors.surface,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
    color: designSystem.colors.textPrimary,
  },
  localNote: {
    color: designSystem.colors.textMuted,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    marginBottom: spacing.md,
  },
});
