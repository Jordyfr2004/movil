import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { ROUTES } from "../navigation/routes";
import { Screen } from "../components/Screen";
import { AppButton } from "../components/AppButton";
import { useMenuByRestaurant } from "../hooks/useMenuByRestaurant";
import { createReservation } from "../services/reservationService";
import { mockUser } from "../constants/mockUser";
import { formatMenuDate } from "../utils/date";
import { colors, typography } from "../theme";
import { spacing } from "../constants/spacing";

const getRemainingQuota = (available: number, reserved: number) =>
  Math.max(available - reserved, 0);

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.Menu>;

export function MenuScreen({ route, navigation }: Props) {
  const { restaurantId, restaurantName } = route.params;
  const { menu, loading } = useMenuByRestaurant(restaurantId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userId = mockUser.id;
  const remainingQuota = menu
    ? getRemainingQuota(menu.availableQuota, menu.reservedQuota)
    : 0;
  const canReserve = Boolean(menu) && remainingQuota > 0 && !isSubmitting;

  const handleReserve = async () => {
    if (!menu || remainingQuota <= 0 || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      await createReservation({ userId, menuId: menu.id });
      Alert.alert(
        "Reserva confirmada",
        "Tu cupo fue reservado correctamente.",
        [
          {
            text: "Ver reservas",
            onPress: () => navigation.navigate(ROUTES.MyReservations, { userId }),
          },
        ],
        { cancelable: false }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Menu del dia</Text>
        <Text style={styles.subtitle}>{restaurantName}</Text>
      </View>

      {loading ? (
        <Text style={styles.helperText}>Cargando menu...</Text>
      ) : menu ? (
        <View style={styles.card}>
          <Text style={styles.menuTitle}>{menu.title}</Text>
          <Text style={styles.menuDate}>{formatMenuDate(menu.menuDate)}</Text>
          <Text style={styles.menuDescription}>{menu.description}</Text>
          <View style={styles.quotaRow}>
            <View style={styles.quotaItem}>
              <Text style={styles.quotaLabel}>Disponibles</Text>
              <Text style={styles.quotaValue}>{remainingQuota}</Text>
            </View>
            <View style={styles.quotaItem}>
              <Text style={styles.quotaLabel}>Reservados</Text>
              <Text style={styles.quotaValue}>{menu.reservedQuota}</Text>
            </View>
          </View>
        </View>
      ) : (
        <Text style={styles.helperText}>
          No hay menu activo para hoy.
        </Text>
      )}

      <View style={styles.footer}>
        <AppButton
          label={isSubmitting ? "Reservando..." : "Reservar cupo"}
          onPress={handleReserve}
          disabled={!canReserve}
        />
      </View>
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  menuDate: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  menuDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  quotaRow: {
    flexDirection: "row",
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  quotaItem: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.sm,
  },
  quotaLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  quotaValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  helperText: {
    textAlign: "center",
    color: colors.textSecondary,
  },
  footer: {
    marginTop: "auto",
  },
});
