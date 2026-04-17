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
    <Screen style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.kicker} numberOfLines={1}>
          {restaurantName}
        </Text>
        <Text style={styles.title}>Menú del día</Text>
        <Text style={styles.subtitle}>
          Confirma tu cupo antes de que se agote.
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingCard}>
          <View style={styles.skeletonLineLg} />
          <View style={styles.skeletonLineSm} />
          <View style={styles.skeletonBlock} />
        </View>
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
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No hay menú activo</Text>
          <Text style={styles.emptySubtitle}>
            Vuelve más tarde para ver el menú disponible.
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <AppButton
          label={isSubmitting ? "Reservando…" : "Reservar cupo"}
          onPress={handleReserve}
          disabled={!canReserve}
        />
        {!loading && menu && remainingQuota <= 0 ? (
          <Text style={styles.footerHint}>No quedan cupos disponibles por hoy.</Text>
        ) : null}
      </View>
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
  kicker: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    fontWeight: typography.weights.semiBold,
    letterSpacing: 0.2,
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
  menuTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeights.lg,
  },
  menuDate: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  menuDescription: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.md,
    marginTop: spacing.md,
  },
  quotaRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  quotaItem: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  quotaLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  quotaValue: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeights.xl,
  },
  loadingCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  skeletonLineLg: {
    height: 16,
    borderRadius: 10,
    backgroundColor: colors.surfaceMuted,
    width: "65%",
  },
  skeletonLineSm: {
    height: 12,
    borderRadius: 10,
    backgroundColor: colors.surfaceMuted,
    width: "45%",
  },
  skeletonBlock: {
    height: 84,
    borderRadius: 14,
    backgroundColor: colors.surfaceMuted,
  },
  emptyCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
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
  footer: {
    marginTop: "auto",
    gap: spacing.sm,
  },
  footerHint: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    lineHeight: typography.lineHeights.sm,
  },
});
