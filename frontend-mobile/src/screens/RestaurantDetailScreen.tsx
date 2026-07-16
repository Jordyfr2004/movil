import React, { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import {
  RestaurantDetailHeader,
  RestaurantDetailSummary,
  RestaurantDishesSection,
} from "../components/restaurantDetail";
import { Screen } from "../components/Screen";
import { spacing } from "../constants/spacing";
import { useAuth } from "../context/AuthContext";
import { useDishesByRestaurant } from "../hooks/useDishesByRestaurant";
import { ROUTES } from "../navigation/routes";
import { RootStackParamList } from "../navigation/types";
import { createReservation } from "../services/reservationService";
import { studentPalette } from "../theme/studentPalette";

type UnknownRecord = Record<string, unknown>;

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.RestaurantDetail
>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
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

  const canReserve = useMemo(
    () => Boolean(isAuthenticated && accessToken),
    [isAuthenticated, accessToken]
  );

  const reservedDishIdSet = useMemo(() => new Set<string>(), []);

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

    try {
      setIsReservingDishId(dishId);

      await createReservation(accessToken, {
        items: [{ dish_id: dishId, quantity: 1 }],
      });

      Alert.alert(
        "Reserva realizada",
        "Tu reserva fue creada correctamente."
      );
    } catch (error: unknown) {
      const message = readErrorMessage(error, "No se pudo crear la reserva");
      Alert.alert("Error", message);
    } finally {
      setIsReservingDishId(null);
    }
  };

  return (
    <Screen style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <RestaurantDetailHeader initial={initial} restaurant={restaurant} />
        <RestaurantDetailSummary description={restaurant.description} />

        <RestaurantDishesSection
          dishes={dishes}
          error={error}
          isCheckingReservation={false}
          isReservingDishId={isReservingDishId}
          loading={loading}
          onReload={reload}
          onReserve={handleReserve}
          reservedDishIdSet={reservedDishIdSet}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: studentPalette.background,
  },
  content: {
    paddingBottom: spacing.xxxl,
  },
  scroll: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
