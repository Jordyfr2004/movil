import { useCallback, useState } from "react";
import { getReservationsByUser } from "../services/reservationService";
import { menusMock } from "../mocks/menus";
import { restaurantsMock } from "../mocks/restaurants";
import { Reservation } from "../types/models";

export type ReservationListItem = Reservation & {
  menuTitle: string;
  menuDate: string;
  restaurantName: string;
};

const buildReservationItem = (reservation: Reservation): ReservationListItem => {
  const menu = menusMock.find((item) => item.id === reservation.menuId);
  const restaurant = restaurantsMock.find(
    (item) => item.id === menu?.restaurantId
  );

  return {
    ...reservation,
    menuTitle: menu?.title ?? "Menu no disponible",
    menuDate: menu?.menuDate ?? "",
    restaurantName: restaurant?.name ?? "Restaurante no disponible",
  };
};

export function useReservations(userId: number) {
  const [reservations, setReservations] = useState<ReservationListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);

    return getReservationsByUser(userId)
      .then((data) => {
        setReservations(data.map(buildReservationItem));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId]);

  return { reservations, loading, reload };
}
