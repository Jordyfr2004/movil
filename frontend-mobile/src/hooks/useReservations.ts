import { useCallback, useEffect, useRef, useState } from "react";
import { useNetworkStatus } from "../context/NetworkContext";
import { getPublicDishesByRestaurant } from "../services/dishService";
import { isSessionExpiryInProgress } from "../services/sessionExpiryService";
import { getMyReservations } from "../services/reservationService";
import { getRestaurants } from "../services/restaurantService";
import { Reservation, ReservationItem } from "../types/models";

export type EnrichedReservationItem = ReservationItem & {
  dishImageUrl?: string | null;
};

export type ReservationListItem = Omit<Reservation, "items"> & {
  items: EnrichedReservationItem[];
  restaurantName: string;
  restaurantImageUrl?: string | null;
  title: string;
  reservationDate: string;
};

function buildReservationTitle(reservation: Reservation) {
  const first = reservation.items?.[0];
  if (!first) {
    return "Reserva";
  }

  return first.dishName;
}

function isSessionError(error: unknown) {
  const status =
    typeof error === "object" &&
    error !== null &&
    typeof (error as { status?: unknown }).status === "number"
      ? (error as { status: number }).status
      : undefined;
  const statusCode =
    typeof error === "object" &&
    error !== null &&
    typeof (error as { statusCode?: unknown }).statusCode === "number"
      ? (error as { statusCode: number }).statusCode
      : undefined;
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  return (
    status === 401 ||
    statusCode === 401 ||
    message.includes("401") ||
    message.includes("token") ||
    message.includes("sesión") ||
    message.includes("sesion")
  );
}

export function useReservations(accessToken: string | null) {
  const [reservations, setReservations] = useState<ReservationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { recoveryTick } = useNetworkStatus();
  const requestRef = useRef<Promise<void> | null>(null);

  const reload = useCallback(() => {
    if (!accessToken) {
      setReservations([]);
      setLoading(false);
      setError(null);
      return Promise.resolve();
    }

    if (requestRef.current) {
      return requestRef.current;
    }

    setLoading(true);
    setError(null);

    const request = Promise.allSettled([getMyReservations(accessToken), getRestaurants()])
      .then(async (results) => {
        const reservationsResult = results[0];
        const restaurantsResult = results[1];

        const reservationList =
          reservationsResult.status === "fulfilled" ? reservationsResult.value : [];

        const restaurants =
          restaurantsResult.status === "fulfilled" ? restaurantsResult.value : [];

        const restaurantNameById = new Map(
          restaurants
            .filter((r) => r?.id && r?.name)
            .map((r) => [String(r.id), r.name] as const)
        );
        const restaurantImageById = new Map(
          restaurants
            .filter((r) => r?.id)
            .map((r) => [String(r.id), r.imageUrl ?? null] as const)
        );
        const restaurantIds = Array.from(
          new Set(
            reservationList
              .flatMap((reservation) =>
                reservation.items.map((item) => item.restaurantId)
              )
              .filter(Boolean)
              .map(String)
          )
        );
        const dishResults = await Promise.allSettled(
          restaurantIds.map(async (restaurantId) => {
            const dishes = await getPublicDishesByRestaurant(restaurantId);
            return dishes.map((dish) => ({
              id: String(dish.id),
              imageUrl: dish.imageUrl ?? null,
            }));
          })
        );
        const dishImageById = new Map(
          dishResults.flatMap((result) =>
            result.status === "fulfilled"
              ? result.value
                  .filter((dish) => dish.imageUrl)
                  .map((dish) => [dish.id, dish.imageUrl] as const)
              : []
          )
        );

        const enriched = reservationList.map((reservation) => {
          const restaurantId = reservation.items?.[0]?.restaurantId;
          const resolvedRestaurantName = restaurantId
            ? restaurantNameById.get(String(restaurantId))
            : undefined;

          return {
            ...reservation,
            items: reservation.items.map((item) => ({
              ...item,
              dishImageUrl:
                item.dishImageUrl ?? dishImageById.get(String(item.dishId)) ?? null,
            })),
            title: buildReservationTitle(reservation),
            reservationDate: reservation.createdAt,
            restaurantImageUrl: restaurantId
              ? restaurantImageById.get(String(restaurantId)) ?? null
              : null,
            restaurantName: resolvedRestaurantName ?? "Restaurante no disponible",
          };
        });

        setReservations(enriched);

        if (
          reservationsResult.status === "rejected" &&
          (isSessionError(reservationsResult.reason) ||
            isSessionExpiryInProgress())
        ) {
          setReservations([]);
          setError(null);
        } else if (reservationsResult.status === "rejected") {
          setError(
            reservationsResult.reason instanceof Error
              ? reservationsResult.reason.message
              : "No se pudieron cargar las reservas"
          );
        } else {
          setError(null);
        }
      })
      .finally(() => {
        setLoading(false);
        requestRef.current = null;
      });

    requestRef.current = request;
    return request;
  }, [accessToken]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (recoveryTick <= 0) return;
    void reload();
  }, [recoveryTick, reload]);

  return { reservations, loading, error, reload };
}
