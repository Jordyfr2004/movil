import React, { useCallback, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AppButton } from "../components/AppButton";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { ErrorMessage } from "../components/ErrorMessage";
import { Screen } from "../components/Screen";
import { StatusBadge } from "../components/StatusBadge";
import { spacing } from "../constants/spacing";
import { useAuth } from "../context/AuthContext";
import { useDishesByRestaurant } from "../hooks/useDishesByRestaurant";
import { ROUTES } from "../navigation/routes";
import { RootStackParamList } from "../navigation/types";
import {
  createReservation,
  getMyReservations,
} from "../services/reservationService";
import { colors, typography } from "../theme";

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.RestaurantDetail
>;

export function RestaurantDetailScreen({ navigation, route }: Props) {
  const { restaurant } = route.params;
  const initial = restaurant.name?.trim()?.charAt(0)?.toUpperCase() ?? "R";
  const restaurantId = String(restaurant.id);
  const { dishes, loading, error, reload } = useDishesByRestaurant(restaurantId);
  const { accessToken, isAuthenticated } = useAuth();
  const [isReservingDishId, setIsReservingDishId] = useState<string | null>(
    null
  );
  const [reservedDishIds, setReservedDishIds] = useState<string[]>([]);
  const [isCheckingReservation, setIsCheckingReservation] = useState(false);

  const canReserve = useMemo(
    () => Boolean(isAuthenticated && accessToken),
    [isAuthenticated, accessToken]
  );

  const reservedDishIdSet = useMemo(
    () => new Set(reservedDishIds),
    [reservedDishIds]
  );

  const refreshReservedDishes = useCallback(async () => {
    if (!accessToken) {
      setReservedDishIds([]);
      return;
    }

    try {
      setIsCheckingReservation(true);
      const list = await getMyReservations(accessToken);
      const activeDishIds = list
        .filter(
          (reservation) =>
            reservation.status === "confirmed" ||
            reservation.status === "pending_payment"
        )
        .map((reservation) => reservation.items?.[0]?.dishId)
        .filter((id): id is string => Boolean(id));

      setReservedDishIds(Array.from(new Set(activeDishIds)));
    } catch {
      setReservedDishIds([]);
    } finally {
      setIsCheckingReservation(false);
    }
  }, [accessToken]);

  useFocusEffect(
    useCallback(() => {
      refreshReservedDishes();
    }, [refreshReservedDishes])
  );

  const handleReserve = async (dishId: string) => {
    if (!canReserve || !accessToken) {
      Alert.alert("Sesión requerida", "Inicia sesión para poder reservar.", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Iniciar sesión",
          onPress: () => navigation.navigate(ROUTES.Login),
        },
      ]);
      return;
    }

    if (isReservingDishId) {
      return;
    }

    if (reservedDishIdSet.has(dishId)) {
      return;
    }

    try {
      setIsReservingDishId(dishId);
      await createReservation(accessToken, {
        items: [{ dish_id: dishId, quantity: 1 }],
      });

      setReservedDishIds((previous) =>
        previous.includes(dishId) ? previous : [...previous, dishId]
      );
    } catch (error: any) {
      const message = error?.message || "No se pudo crear la reserva";
      const status = error?.status;

      if (
        status === 400 &&
        typeof message === "string" &&
        message.toLowerCase().includes("ya reservaste")
      ) {
        setReservedDishIds((previous) =>
          previous.includes(dishId) ? previous : [...previous, dishId]
        );
        return;
      }

      Alert.alert("Error", message);
    } finally {
      setIsReservingDishId(null);
    }
  };

  return (
    <Screen style={styles.container}>
      <Card style={styles.hero}>
        <View style={styles.heroHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>

          <View style={styles.heroText}>
            <Text style={styles.name} numberOfLines={2}>
              {restaurant.name}
            </Text>
            {restaurant.location ? (
              <Text style={styles.location} numberOfLines={1}>
                {restaurant.location}
              </Text>
            ) : null}
          </View>

          <StatusBadge
            label={restaurant.isActive ? "Abierto" : "Cerrado"}
            tone={restaurant.isActive ? "success" : "danger"}
          />
        </View>

        {restaurant.openingTime && restaurant.closingTime ? (
          <View style={styles.metaRow}>
            <Card variant="muted" style={styles.metaItem}>
              <Text style={styles.metaLabel}>Horario</Text>
              <Text style={styles.metaValue}>
                {restaurant.openingTime} - {restaurant.closingTime}
              </Text>
            </Card>
          </View>
        ) : null}
      </Card>

      {restaurant.description ? (
        <Card>
          <Text style={styles.cardTitle}>Descripción</Text>
          <Text style={styles.cardText}>{restaurant.description}</Text>
        </Card>
      ) : null}

      <Card style={styles.menuCard}>
        <Text style={styles.menuTitle}>Menú del día</Text>
        <Text style={styles.menuSubtitle}>
          Platos disponibles para reservar.
        </Text>

        {loading ? (
          <View style={styles.menuLoading}>
            <View style={styles.skeletonLineLg} />
            <View style={styles.skeletonLineSm} />
            <View style={styles.skeletonLineLg} />
          </View>
        ) : error ? (
          <ErrorMessage
            title="No se pudieron cargar los platos"
            message={error}
            onRetry={reload}
            style={styles.feedbackState}
          />
        ) : dishes.length > 0 ? (
          <View style={styles.menuList}>
            {dishes.map((dish) => (
              <View key={dish.id} style={styles.dishRow}>
                <View style={styles.dishText}>
                  <Text style={styles.dishName} numberOfLines={1}>
                    {dish.name}
                  </Text>
                  {dish.description ? (
                    <Text style={styles.dishMeta} numberOfLines={2}>
                      {dish.description}
                    </Text>
                  ) : null}
                </View>

                <View style={styles.dishActions}>
                  <Text style={styles.dishPrice} numberOfLines={1}>
                    ${dish.price}
                  </Text>

                  <AppButton
                    label={
                      isReservingDishId === dish.id
                        ? "Reservando…"
                        : reservedDishIdSet.has(String(dish.id))
                          ? "Ya reservaste"
                          : "Reservar"
                    }
                    variant="secondary"
                    size="sm"
                    disabled={
                      Boolean(isReservingDishId) ||
                      reservedDishIdSet.has(String(dish.id)) ||
                      isCheckingReservation
                    }
                    onPress={() => handleReserve(dish.id)}
                  />
                </View>
              </View>
            ))}
          </View>
        ) : (
          <EmptyState
            title="No hay platos disponibles"
            message="Vuelve más tarde para ver el menú."
            iconName="food-off-outline"
            style={styles.feedbackState}
          />
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    marginBottom: spacing.lg,
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  heroText: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeights.xl,
  },
  location: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
  metaRow: {
    marginTop: spacing.lg,
  },
  metaItem: {
    borderRadius: 14,
    padding: spacing.md,
  },
  metaLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  metaValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
  },
  cardTitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.semiBold,
    marginBottom: spacing.sm,
  },
  cardText: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    lineHeight: typography.lineHeights.md,
  },
  menuCard: {
    marginTop: spacing.lg,
  },
  menuTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  menuSubtitle: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
  menuLoading: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  skeletonLineLg: {
    height: 14,
    borderRadius: 10,
    backgroundColor: colors.surfaceMuted,
    width: "70%",
  },
  skeletonLineSm: {
    height: 12,
    borderRadius: 10,
    backgroundColor: colors.surfaceMuted,
    width: "45%",
  },
  menuList: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  feedbackState: {
    marginTop: spacing.lg,
  },
  dishRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dishText: {
    flex: 1,
    gap: 2,
    lineHeight: typography.lineHeights.sm,
  },
  dishName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeights.md,
  },
  dishActions: {
    alignItems: "flex-end",
    justifyContent: "center",
    gap: spacing.xs,
  },
  dishMeta: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    lineHeight: typography.lineHeights.sm,
  },
  dishPrice: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
});
