import { API_URL } from "../constants/api";

const REQUEST_TIMEOUT = 8000;

export type Dish = {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  price: string;
  isAvailable: boolean;
  isActive: boolean;
};

type DishApi = {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string | null;
  price: string;
  is_available: boolean;
  is_active: boolean;
  // algunos backends/frontends devuelven camelCase
  restaurantId?: string;
  descriptionText?: string | null;
  isAvailable?: boolean;
  isActive?: boolean;
};

type CreateDishPayload = {
  name: string;
  description?: string;
  price: string;
  is_available?: boolean;
  is_active?: boolean;
};

type UpdateDishPayload = Partial<CreateDishPayload>;

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

function normalizeDish(item: any): Dish {
  const api = item as Partial<DishApi>;

  const parseBoolean = (value: unknown, fallback: boolean) => {
    if (value === undefined || value === null) return fallback;
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value === 1;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (normalized === "true" || normalized === "1") return true;
      if (normalized === "false" || normalized === "0") return false;
    }
    return Boolean(value);
  };

  return {
    id: String(api?.id ?? ""),
    restaurantId: String(api?.restaurant_id ?? api?.restaurantId ?? ""),
    name: typeof api?.name === "string" ? api.name : "",
    description:
      typeof (api?.description ?? api?.descriptionText) === "string" &&
      (api.description ?? api.descriptionText)?.trim().length
        ? String(api.description ?? api.descriptionText).trim()
        : undefined,
    price: typeof api?.price === "string" ? api.price : String(api?.price ?? ""),
    isAvailable: parseBoolean(api?.is_available ?? api?.isAvailable, true),
    isActive: parseBoolean(api?.is_active ?? api?.isActive, true),
  };
}

export async function getPublicDishesByRestaurant(
  restaurantId: string
): Promise<Dish[]> {
  if (!restaurantId) return [];

  const result = await requestWithTimeout<any>(
    `/dishes/restaurant/${encodeURIComponent(restaurantId)}`,
    {
      method: "GET",
    }
  );

  const payload = Array.isArray((result as any)?.data)
    ? (result as any).data
    : result;

  const list = Array.isArray(payload) ? payload : [];

  return list
    .map(normalizeDish)
    .filter((dish) => Boolean(dish?.id) && Boolean(dish?.name));
}

export async function createDish(
  accessToken: string,
  payload: CreateDishPayload
): Promise<Dish> {
  const result = await requestWithTimeout<any>("/dishes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  const created = (result as any)?.data ?? result;
  return normalizeDish(created);
}

export async function getManagerDishes(accessToken: string): Promise<Dish[]> {
  const result = await requestWithTimeout<any>("/dishes", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const payload = Array.isArray((result as any)?.data)
    ? (result as any).data
    : result;

  const list = Array.isArray(payload) ? payload : [];

  return list
    .map(normalizeDish)
    .filter((dish) => Boolean(dish?.id) && Boolean(dish?.name));
}

export async function updateDish(
  accessToken: string,
  dishId: string,
  payload: UpdateDishPayload
): Promise<Dish> {
  const result = await requestWithTimeout<any>(
    `/dishes/${encodeURIComponent(dishId)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    }
  );

  const updated = (result as any)?.data ?? result;
  return normalizeDish(updated);
}

export async function deleteDish(
  accessToken: string,
  dishId: string
): Promise<{ message?: string } | any> {
  return requestWithTimeout<any>(`/dishes/${encodeURIComponent(dishId)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
