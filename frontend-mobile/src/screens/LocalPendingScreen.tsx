import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { EmptyState, Screen } from "../components";
import { spacing } from "../constants/spacing";
import { LocalRating, LocalProblemReport, useLocalFeedback } from "../context/LocalFeedbackContext";
import { ROUTES } from "../navigation/routes";
import { StudentStackParamList } from "../navigation/types";
import { designSystem, typography } from "../theme";
import { studentPalette } from "../theme/studentPalette";

type Props = NativeStackScreenProps<
  StudentStackParamList,
  typeof ROUTES.LocalPending
>;

const REPORT_LABELS: Record<LocalProblemReport["type"], string> = {
  missing_product: "Producto faltante",
  wrong_product: "Producto incorrecto",
  wrong_charge: "Cobro incorrecto",
  payment_problem: "Problema con pago",
  long_wait: "Mucha espera",
  other: "Otro",
};

export function LocalPendingScreen({ navigation }: Props) {
  const { ratings, reports } = useLocalFeedback();

  return (
    <Screen style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Pendientes</Text>
          <Text style={styles.subtitle}>
            Tus calificaciones y reportes pendientes se guardan en este dispositivo.
          </Text>
        </View>

        <PendingSection
          title="Calificaciones pendientes"
          count={ratings.length}
          emptyTitle="Sin calificaciones pendientes"
          emptyMessage="Las reservas entregadas que califiques aparecerán aquí."
        >
          {ratings.map((item) => (
            <RatingPendingRow
              key={item.id}
              item={item}
              onPress={() =>
                navigation.navigate(ROUTES.PendingDetail, {
                  kind: "rating",
                  id: item.id,
                })
              }
            />
          ))}
        </PendingSection>

        <PendingSection
          title="Reportes pendientes"
          count={reports.length}
          emptyTitle="Sin reportes pendientes"
          emptyMessage="Los reportes guardados localmente aparecerán aquí."
        >
          {reports.map((item) => (
            <ReportPendingRow
              key={item.id}
              item={item}
              onPress={() =>
                navigation.navigate(ROUTES.PendingDetail, {
                  kind: "report",
                  id: item.id,
                })
              }
            />
          ))}
        </PendingSection>
      </ScrollView>
    </Screen>
  );
}

function PendingSection({
  children,
  count,
  emptyMessage,
  emptyTitle,
  title,
}: {
  children: React.ReactNode;
  count: number;
  emptyMessage: string;
  emptyTitle: string;
  title: string;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.counter}>
          <Text style={styles.counterText}>{count}</Text>
        </View>
      </View>
      {count === 0 ? (
        <EmptyState
          title={emptyTitle}
          message={emptyMessage}
          iconName="clipboard-check-outline"
          style={styles.empty}
        />
      ) : (
        <View style={styles.rows}>{children}</View>
      )}
    </View>
  );
}

function RatingPendingRow({
  item,
  onPress,
}: {
  item: LocalRating;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Ver calificación pendiente"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.icon}>
        <MaterialCommunityIcons
          name="star-outline"
          size={designSystem.iconSizes.md}
          color={designSystem.colors.primary}
        />
      </View>
      <View style={styles.cardText}>
        <Text style={styles.cardTitle}>Calificación {item.stars}/5</Text>
        <Text style={styles.cardMessage} numberOfLines={2}>
          {item.tags.join(", ") || item.comment || "Sin comentario"}
        </Text>
        <Text style={styles.cardDate}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={designSystem.iconSizes.md}
        color={designSystem.colors.textMuted}
      />
    </Pressable>
  );
}

function ReportPendingRow({
  item,
  onPress,
}: {
  item: LocalProblemReport;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Ver reporte pendiente"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.icon}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={designSystem.iconSizes.md}
          color={designSystem.colors.primary}
        />
      </View>
      <View style={styles.cardText}>
        <Text style={styles.cardTitle}>{REPORT_LABELS[item.type]}</Text>
        <Text style={styles.cardMessage} numberOfLines={2}>
          {item.comment || "Sin comentario"}
        </Text>
        <Text style={styles.cardDate}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={designSystem.iconSizes.md}
        color={designSystem.colors.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: studentPalette.background },
  scroll: { flex: 1, backgroundColor: "transparent" },
  content: { gap: spacing.lg, paddingBottom: spacing.xxxl },
  header: { gap: spacing.xs },
  title: {
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    color: designSystem.colors.textSecondary,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
  },
  section: { gap: spacing.sm },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  sectionTitle: {
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  counter: {
    minWidth: 30,
    height: 30,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: designSystem.colors.primaryFaint,
    borderWidth: 1,
    borderColor: designSystem.colors.primarySoft,
  },
  counterText: {
    color: designSystem.colors.primary,
    fontWeight: typography.weights.bold,
  },
  empty: {
    paddingVertical: spacing.md,
    backgroundColor: designSystem.colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
  },
  rows: { gap: spacing.sm },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 18,
    backgroundColor: designSystem.colors.surface,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
    ...designSystem.shadows.sm,
  },
  cardPressed: { backgroundColor: designSystem.colors.surfacePressed },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: designSystem.colors.primaryFaint,
  },
  cardText: { flex: 1, minWidth: 0 },
  cardTitle: {
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  cardMessage: {
    color: designSystem.colors.textSecondary,
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  cardDate: {
    color: designSystem.colors.textMuted,
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs,
  },
});
