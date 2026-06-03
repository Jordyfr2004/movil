import type { ReservationStatus } from "../../types/models";

type ReservationStatusTone = "success" | "danger";

export type ReservationStatusBadge = {
  label: string;
  tone: ReservationStatusTone;
};

export function getReservationStatusBadge(
  status: ReservationStatus
): ReservationStatusBadge {
  switch (status) {
    case "confirmed":
      return { label: "Confirmada", tone: "success" };
    case "pending_payment":
      return { label: "Pendiente de pago", tone: "success" };
    case "completed":
      return { label: "Completada", tone: "success" };
    case "expired":
      return { label: "Expirada", tone: "danger" };
    case "cancelled":
    default:
      return { label: "Cancelada", tone: "danger" };
  }
}
