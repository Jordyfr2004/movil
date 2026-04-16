import { Reservation } from "../types/models";

export const reservationsMock: Reservation[] = [
  {
    id: 1,
    userId: 1,
    menuId: 1,
    status: "confirmed",
    reservationDate: "2026-04-14T09:10:00.000Z",
  },
  {
    id: 2,
    userId: 1,
    menuId: 2,
    status: "confirmed",
    reservationDate: "2026-04-14T11:25:00.000Z",
  },
];
