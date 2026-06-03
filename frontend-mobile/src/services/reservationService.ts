import { httpClient } from "../api";
import { Reservation, ReservationItem, ReservationStatus } from "../types/models";

type UnknownRecord = Record<string, unknown>;

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

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function unwrapData(value: unknown): unknown {
  if (isRecord(value) && value.data !== undefined) {
    return value.data;
  }

  return value;
}

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

function normalizeReservationItem(item: unknown): ReservationItem {
  const source = isRecord(item) ? item : {};

  return {
    id: String(source.id ?? ""),
    dishId: String(source.dish_id ?? source.dishId ?? ""),
    dishName: typeof source.dish_name === "string" ? source.dish_name : "",
    dishDescription:
      typeof source.dish_description === "string"
        ? source.dish_description
        : null,
    restaurantId: String(source.restaurant_id ?? source.restaurantId ?? ""),
    unitPrice: normalizeNumber(source.unit_price ?? source.unitPrice),
  };
}

function normalizeReservation(payload: unknown): Reservation {
  const source = isRecord(payload) ? payload : {};
  const items = Array.isArray(source.items) ? source.items : [];

  return {
    id: String(source.id ?? ""),
    status: normalizeStatus(source.status),
    createdAt: String(source.created_at ?? source.createdAt ?? ""),
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

  const payload = unwrapData(result);
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

  return normalizeReservation(unwrapData(result));
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

  return normalizeReservation(unwrapData(result));
}
