import React, { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { ROUTES } from "../navigation/routes";
import { Screen } from "../components/Screen";
import { StatusBadge } from "../components/StatusBadge";
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
      "Esta accion liberara tu cupo. Deseas continuar?",
      [
        { text: "Volver", style: "cancel" },
        { text: "Cancelar reserva", style: "destructive", onPress: () => handleCancel(reservationId) },
      ]
    );
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Mis reservas</Text>
        <Text style={styles.subtitle}>Consulta tus reservas activas.</Text>
      </View>

      <FlatList
        data={reservations}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.menuTitle}</Text>
              <StatusBadge
                label={item.status === "confirmed" ? "Confirmada" : "Cancelada"}
                tone={item.status === "confirmed" ? "success" : "danger"}
              />
            </View>
            <Text style={styles.cardSubtitle}>{item.restaurantName}</Text>
            <Text style={styles.cardDate}>
              {formatReservationDate(item.reservationDate)}
            </Text>
            {item.status === "confirmed" ? (
              <Pressable
                onPress={() => confirmCancel(item.id)}
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.cancelButtonPressed,
                ]}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
            ) : null}
          </View>
        )}
        ListEmptyComponent={
          loading ? (
            <Text style={styles.helperText}>Cargando reservas...</Text>
          ) : (
            <Text style={styles.helperText}>
              Aun no tienes reservas registradas.
            </Text>
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  listContent: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  cardTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
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
  cancelButton: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonPressed: {
    opacity: 0.8,
  },
  cancelButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.error,
    fontWeight: typography.weights.semiBold,
  },
  helperText: {
    textAlign: "center",
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
});
