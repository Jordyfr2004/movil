import { reservationsMock } from "../mocks/reservations";
import { Reservation } from "../types/models";

let reservations = [...reservationsMock];
let nextId = reservations.reduce((max, item) => Math.max(max, item.id), 0) + 1;

type CreateReservationInput = {
  userId: number;
  menuId: number;
};

export async function getReservationsByUser(
  userId: number
): Promise<Reservation[]> {
  const userReservations = reservations.filter(
    (reservation) => reservation.userId === userId
  );

  return Promise.resolve(userReservations);
}

export async function createReservation(
  input: CreateReservationInput
): Promise<Reservation> {
  const reservation: Reservation = {
    id: nextId,
    userId: input.userId,
    menuId: input.menuId,
    status: "confirmed",
    reservationDate: new Date().toISOString(),
  };

  nextId += 1;
  reservations = [reservation, ...reservations];

  return Promise.resolve(reservation);
}

export async function cancelReservation(
  reservationId: number
): Promise<Reservation | null> {
  const reservationIndex = reservations.findIndex(
    (item) => item.id === reservationId
  );

  if (reservationIndex === -1) {
    return Promise.resolve(null);
  }

  const updatedReservation: Reservation = {
    ...reservations[reservationIndex],
    status: "cancelled",
  };

  reservations = reservations.map((item) =>
    item.id === reservationId ? updatedReservation : item
  );

  return Promise.resolve(updatedReservation);
}
