import { useCallback, useState } from "react";
import { getReservationsByUser } from "../services/reservationService";
import { menusMock } from "../mocks/menus";
import { getRestaurants } from "../services/restaurantService";
import { Reservation } from "../types/models";

export type ReservationListItem = Reservation & {
  menuTitle: string;
  menuDate: string;
  restaurantName: string;
};

export function useReservations(userId: number) {
  const [reservations, setReservations] = useState<ReservationListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);

    return Promise.allSettled([getReservationsByUser(userId), getRestaurants()])
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
          const menu = menusMock.find((item) => item.id === reservation.menuId);
          const restaurantId = menu?.restaurantId;
          const resolvedRestaurantName = restaurantId
            ? restaurantNameById.get(String(restaurantId))
            : undefined;

          return {
            ...reservation,
            menuTitle: menu?.title ?? "Menu no disponible",
            menuDate: menu?.menuDate ?? "",
            restaurantName: resolvedRestaurantName ?? "Restaurante no disponible",
          };
        });

        setReservations(enriched);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId]);

  return { reservations, loading, reload };
}
