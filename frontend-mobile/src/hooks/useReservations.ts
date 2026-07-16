import { useCallback, useState } from "react";
import { isSessionExpiryInProgress } from "../services/sessionExpiryService";
import { getMyReservations } from "../services/reservationService";
import { getRestaurants } from "../services/restaurantService";
import { Reservation } from "../types/models";

export type ReservationListItem = Reservation & {
  restaurantName: string;
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

  const reload = useCallback(() => {
    if (!accessToken) {
      setReservations([]);
      setLoading(false);
      setError(null);
      return Promise.resolve();
    }

    setLoading(true);
    setError(null);

    return Promise.allSettled([getMyReservations(accessToken), getRestaurants()])
      .then((results) => {
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

        const enriched = reservationList.map((reservation) => {
          const restaurantId = reservation.items?.[0]?.restaurantId;
          const resolvedRestaurantName = restaurantId
            ? restaurantNameById.get(String(restaurantId))
            : undefined;

          return {
            ...reservation,
            title: buildReservationTitle(reservation),
            reservationDate: reservation.createdAt,
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
      });
  }, [accessToken]);

  return { reservations, loading, error, reload };
}
