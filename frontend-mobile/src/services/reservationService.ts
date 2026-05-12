import { API_URL } from "../constants/api";
import { Reservation, ReservationItem, ReservationStatus } from "../types/models";

const REQUEST_TIMEOUT = 8000;

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
  items: Array<{ dish_id: string }>;
};

async function requestWithTimeout<T>(
  endpoint: string,
  options: RequestInit
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      const error: any = new Error(result?.message || "Error en la solicitud");
      error.status = response.status;
      throw error;
    }

    return result as T;
  } catch (error: any) {
    if (error?.name === "AbortError") {
      throw new Error("El servidor tardó demasiado en responder");
    }

    if (
      error?.message?.includes("Network request failed") ||
      error?.message?.toLowerCase?.().includes("network")
    ) {
      throw new Error("No se pudo conectar con el servidor");
    }

    throw new Error(error?.message || "Ocurrió un error inesperado");
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeStatus(value: unknown): ReservationStatus {
  if (typeof value !== "string") return "confirmed";
  const upper = value.toUpperCase();
  if (upper === "CANCELLED" || upper === "CANCELED") return "cancelled";
  if (upper === "CONFIRMED") return "confirmed";
  if (value.toLowerCase() === "cancelled") return "cancelled";
  return "confirmed";
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
  const result = await requestWithTimeout<ApiEnvelope<ReservationApi[]>>("/reservations/my", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const payload = (result as any)?.data ?? result;
  const list = Array.isArray(payload) ? payload : [];
  return list.map(normalizeReservation).filter((r) => Boolean(r.id));
}

export async function createReservation(
  accessToken: string,
  payload: CreateReservationPayload
): Promise<Reservation> {
  const result = await requestWithTimeout<ApiEnvelope<ReservationApi>>("/reservations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = (result as any)?.data ?? result;
  return normalizeReservation(data);
}

export async function cancelReservation(
  accessToken: string,
  reservationId: string
): Promise<Reservation> {
  const result = await requestWithTimeout<ApiEnvelope<ReservationApi>>(
    `/reservations/${reservationId}/cancel`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = (result as any)?.data ?? result;
  return normalizeReservation(data);
}
