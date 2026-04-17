import React, { useCallback, useMemo, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { ROUTES } from "../navigation/routes";
import { Screen } from "../components/Screen";
import { StatusBadge } from "../components/StatusBadge";
import { AppButton } from "../components/AppButton";
import { useReservations } from "../hooks/useReservations";
import { cancelReservation } from "../services/reservationService";
import { formatReservationDate } from "../utils/date";
import { colors, typography } from "../theme";
import { spacing } from "../constants/spacing";

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.MyReservations
>;

export function MyReservationsScreen({ route }: Props) {
  const { userId } = route.params;
  const { reservations, loading, reload } = useReservations(userId);
  const [isCancelling, setIsCancelling] = useState(false);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const confirmedCount = useMemo(
    () => reservations.filter((r) => r.status === "confirmed").length,
    [reservations]
  );

  const handleCancel = async (reservationId: number) => {
    if (isCancelling) {
      return;
    }

    try {
      setIsCancelling(true);
      await cancelReservation(reservationId);
      await reload();
    } finally {
      setIsCancelling(false);
    }
  };

  const confirmCancel = (reservationId: number) => {
    Alert.alert(
      "Cancelar reserva",
      "Esta acción liberará tu cupo. ¿Deseas continuar?",
      [
        { text: "Volver", style: "cancel" },
        {
          text: "Cancelar",
          style: "destructive",
          onPress: () => handleCancel(reservationId),
        },
      ]
    );
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis reservas</Text>
        <Text style={styles.subtitle}>
          {loading
            ? "Cargando tus reservas…"
            : confirmedCount > 0
              ? `Tienes ${confirmedCount} reserva${confirmedCount === 1 ? "" : "s"} activa${confirmedCount === 1 ? "" : "s"}.`
              : "No tienes reservas activas por ahora."}
        </Text>
      </View>

      <FlatList
        data={reservations}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.menuTitle}
              </Text>
              <StatusBadge
                label={item.status === "confirmed" ? "Confirmada" : "Cancelada"}
                tone={item.status === "confirmed" ? "success" : "danger"}
              />
            </View>

            <Text style={styles.cardSubtitle} numberOfLines={1}>
              {item.restaurantName}
            </Text>
            <Text style={styles.cardDate}>
              {formatReservationDate(item.reservationDate)}
            </Text>

            {item.status === "confirmed" ? (
              <View style={styles.cardFooter}>
                <AppButton
                  label={isCancelling ? "Cancelando…" : "Cancelar"}
                  onPress={() => confirmCancel(item.id)}
                  variant="danger"
                  size="sm"
                  disabled={isCancelling}
                />
              </View>
            ) : null}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>
              {loading ? "Cargando reservas…" : "Aún no tienes reservas"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {loading
                ? "Espera un momento mientras actualizamos la información."
                : "Cuando reserves un menú, aparecerá aquí."}
            </Text>
          </View>
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeights.xl,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.md,
  },
  listContent: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeights.md,
  },
  cardSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  cardDate: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  cardFooter: {
    marginTop: spacing.lg,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  emptyCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
  emptyTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
});
