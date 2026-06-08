import React, { useCallback, useMemo, useState } from "react";
import { Alert, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import {
  RestaurantDetailHeader,
  RestaurantDetailSummary,
  RestaurantDishesSection,
} from "../components/restaurantDetail";
import { Screen } from "../components/Screen";
import { useAuth } from "../context/AuthContext";
import { useDishesByRestaurant } from "../hooks/useDishesByRestaurant";
import { ROUTES } from "../navigation/routes";
import { RootStackParamList } from "../navigation/types";
import {
  createReservation,
  getMyReservations,
} from "../services/reservationService";

type UnknownRecord = Record<string, unknown>;

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.RestaurantDetail
>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function readErrorStatus(error: unknown): number | undefined {
  if (!isRecord(error)) {
    return undefined;
  }

  return typeof error.status === "number" ? error.status : undefined;
}

function readErrorMessage(error: unknown, fallback: string): string {
  if (!isRecord(error)) {
    return fallback;
  }

  return typeof error.message === "string" && error.message
    ? error.message
    : fallback;
}

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
      Alert.alert(
        "Sesión requerida",
        "Inicia sesión para poder reservar.",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Iniciar sesión",
            onPress: () => navigation.navigate(ROUTES.Login),
          },
        ]
      );
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
    } catch (error: unknown) {
      const message = readErrorMessage(error, "No se pudo crear la reserva");
      const status = readErrorStatus(error);

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
      <RestaurantDetailHeader initial={initial} restaurant={restaurant} />
      <RestaurantDetailSummary description={restaurant.description} />
      <RestaurantDishesSection
        dishes={dishes}
        error={error}
        isCheckingReservation={isCheckingReservation}
        isReservingDishId={isReservingDishId}
        loading={loading}
        onReload={reload}
        onReserve={handleReserve}
        reservedDishIdSet={reservedDishIdSet}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
