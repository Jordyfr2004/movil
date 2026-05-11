import { API_URL } from "../constants/api";
import { Restaurant } from "../types/models";

const REQUEST_TIMEOUT = 8000;

type RestaurantApi = {
  id: string;
  name: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

type RestaurantCreatePayload = {
  name: string;
  is_active?: boolean;
};

type RestaurantCreateResponse = {
  message?: string;
  data?: RestaurantApi;
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

function normalizeRestaurant(item: any): Restaurant {
  const isActive = Boolean(item?.is_active ?? item?.isActive ?? item?.active);

  return {
    id: item?.id,
    name: typeof item?.name === "string" ? item.name : "",
    isActive,
    createdAt: item?.created_at ?? item?.createdAt,
    updatedAt: item?.updated_at ?? item?.updatedAt,
  };
}

export async function getRestaurants(): Promise<Restaurant[]> {
  const result = await requestWithTimeout<any>("/restaurants", {
    method: "GET",
  });

  const payload = Array.isArray(result?.data) ? result.data : result;
  const list = Array.isArray(payload) ? payload : [];

  return list
    .map(normalizeRestaurant)
    .filter((restaurant) => Boolean(restaurant.id) && Boolean(restaurant.name));
}

export async function createRestaurant(
  accessToken: string,
  payload: RestaurantCreatePayload
): Promise<Restaurant> {
  const result = await requestWithTimeout<RestaurantCreateResponse>(
    "/restaurants",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    }
  );

  const created = (result as any)?.data ?? result;
  return normalizeRestaurant(created);
}

export async function getRestaurantById(
  restaurantId: string
): Promise<Restaurant | null> {
  if (!restaurantId) return null;

  const result = await requestWithTimeout<any>(`/restaurants/${restaurantId}`,
    {
      method: "GET",
    }
  );

  const payload = (result as any)?.data ?? result;
  const normalized = normalizeRestaurant(payload);

  if (!normalized?.id || !normalized?.name) return null;
  return normalized;
}
