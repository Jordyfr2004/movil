import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Screen } from "../components";
import { spacing } from "../constants/spacing";
import { ROUTES } from "../navigation/routes";
import { StudentStackParamList } from "../navigation/types";
import { designSystem, typography } from "../theme";
import { studentPalette } from "../theme/studentPalette";
import { HELP_TOPICS, HelpTopicKey } from "./HelpDetailScreen";

type Props = NativeStackScreenProps<StudentStackParamList, typeof ROUTES.Help>;

const HELP_SECTIONS: Array<{
  title: string;
  topics: HelpTopicKey[];
}> = [
  { title: "Sesión y acceso", topics: ["access"] },
  { title: "Pagos", topics: ["payments"] },
  { title: "Reservas", topics: ["cart", "reservations"] },
  { title: "Retiro por QR", topics: ["qr"] },
];

export function HelpScreen({ navigation }: Props) {
  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Ayuda</Text>
        <Text style={styles.subtitle}>Encuentra respuestas rápidas para usar la app.</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {HELP_SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.topics.map((topicKey) => {
              const topic = HELP_TOPICS[topicKey];
              return (
                <Pressable
                  key={topicKey}
                  accessibilityRole="button"
                  accessibilityLabel={`Abrir ayuda de ${topic.title}`}
                  onPress={() =>
                    navigation.navigate(ROUTES.HelpDetail, { topic: topicKey })
                  }
                  style={({ pressed }) => [
                    styles.card,
                    pressed && styles.cardPressed,
                  ]}
                >
                  <View style={styles.icon}>
                    <MaterialCommunityIcons
                      name={topic.icon}
                      size={designSystem.iconSizes.md}
                      color={designSystem.colors.primary}
                    />
                  </View>
                  <View style={styles.text}>
                    <Text style={styles.cardTitle}>{topic.title}</Text>
                    <Text style={styles.cardMessage} numberOfLines={2}>
                      {topic.explanation}
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={designSystem.iconSizes.md}
                    color={designSystem.colors.textMuted}
                  />
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: studentPalette.background },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: designSystem.radii.xl,
    backgroundColor: designSystem.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
    ...designSystem.shadows.low,
  },
  title: {
    color: designSystem.colors.textPrimary,
    fontSize: typography.roles.screenTitle.fontSize,
    lineHeight: typography.roles.screenTitle.lineHeight,
    fontWeight: typography.roles.screenTitle.fontWeight,
  },
  subtitle: {
    color: designSystem.colors.textSecondary,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
  },
  scroll: { flex: 1, backgroundColor: "transparent" },
  content: { gap: spacing.lg, paddingBottom: spacing.xxxl },
  section: { gap: spacing.sm },
  sectionTitle: {
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: designSystem.radii.xl,
    backgroundColor: designSystem.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
    ...designSystem.shadows.low,
  },
  cardPressed: { backgroundColor: designSystem.colors.surfacePressed },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: designSystem.colors.primaryFaint,
  },
  text: { flex: 1, minWidth: 0 },
  cardTitle: {
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  cardMessage: {
    color: designSystem.colors.textSecondary,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
  },
});
