import type { StudentStatusTone } from "../StudentStatusPill";
import type { ReservationStatus } from "../../types/models";

export type ReservationStatusBadge = {
  label: string;
  tone: StudentStatusTone;
};

export function getReservationStatusBadge(
  status: ReservationStatus
): ReservationStatusBadge {
  switch (status) {
    case "confirmed":
      return { label: "Confirmada", tone: "success" };
    case "pending_payment":
      return { label: "Pendiente de pago", tone: "warning" };
    case "completed":
      return { label: "Completada", tone: "info" };
    case "expired":
      return { label: "Expirada", tone: "danger" };
    case "cancelled":
    default:
      return { label: "Cancelada", tone: "danger" };
  }
}
