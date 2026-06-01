import { httpClient } from "../api";
import { Reservation, ReservationItem, ReservationStatus } from "../types/models";

type ReservationItemApi = {
  id: string;
  dish_id: string;
  dish_name: string;
  dish_description?: string | null;
  restaurant_id: string;
  unit_price: string | number;
};

type ReservationApi = {
  id: string;
  status: string;
  created_at?: string;
  createdAt?: string;
  items?: ReservationItemApi[];
};

type ApiEnvelope<T> = {
  message?: string;
  data?: T;
};

type CreateReservationPayload = {
  items: Array<{ dish_id: string; quantity: number }>;
};

function normalizeStatus(value: unknown): ReservationStatus {
  if (typeof value !== "string") return "pending_payment";

  const trimmed = value.trim();
  const upper = trimmed.toUpperCase();
  const lower = trimmed.toLowerCase();

  if (upper === "PENDING_PAYMENT" || lower === "pending_payment") {
    return "pending_payment";
  }

  if (upper === "CONFIRMED" || lower === "confirmed") {
    return "confirmed";
  }

  if (
    upper === "CANCELLED" ||
    upper === "CANCELED" ||
    lower === "cancelled" ||
    lower === "canceled"
  ) {
    return "cancelled";
  }

  if (upper === "EXPIRED" || lower === "expired") {
    return "expired";
  }

  if (upper === "COMPLETED" || lower === "completed") {
    return "completed";
  }

  return "pending_payment";
}

function normalizeNumber(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function normalizeReservationItem(item: any): ReservationItem {
  return {
    id: String(item?.id ?? ""),
    dishId: String(item?.dish_id ?? item?.dishId ?? ""),
    dishName: typeof item?.dish_name === "string" ? item.dish_name : "",
    dishDescription:
      typeof item?.dish_description === "string" ? item.dish_description : null,
    restaurantId: String(item?.restaurant_id ?? item?.restaurantId ?? ""),
    unitPrice: normalizeNumber(item?.unit_price ?? item?.unitPrice),
  };
}

function normalizeReservation(payload: any): Reservation {
  const items = Array.isArray(payload?.items) ? payload.items : [];

  return {
    id: String(payload?.id ?? ""),
    status: normalizeStatus(payload?.status),
    createdAt: String(payload?.created_at ?? payload?.createdAt ?? ""),
    items: items.map(normalizeReservationItem),
  };
}

export async function getMyReservations(accessToken: string): Promise<Reservation[]> {
  const result = await httpClient.get<ApiEnvelope<ReservationApi[]>>(
    "/reservations/my",
    {
      accessToken,
    }
  );

  const payload = (result as any)?.data ?? result;
  const list = Array.isArray(payload) ? payload : [];
  return list.map(normalizeReservation).filter((r) => Boolean(r.id));
}

export async function createReservation(
  accessToken: string,
  payload: CreateReservationPayload
): Promise<Reservation> {
  const result = await httpClient.post<ApiEnvelope<ReservationApi>>(
    "/reservations",
    payload,
    {
      accessToken,
    }
  );

  const data = (result as any)?.data ?? result;
  return normalizeReservation(data);
}

export async function cancelReservation(
  accessToken: string,
  reservationId: string
): Promise<Reservation> {
  const result = await httpClient.patch<ApiEnvelope<ReservationApi>>(
    `/reservations/${reservationId}/cancel`,
    undefined,
    {
      accessToken,
    }
  );

  const data = (result as any)?.data ?? result;
  return normalizeReservation(data);
}
