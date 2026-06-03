import { httpClient } from "../api";

type UnknownRecord = Record<string, unknown>;

export type Dish = {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  price: string;
  isAvailable: boolean;
  isActive: boolean;
};

type CreateDishPayload = {
  name: string;
  description?: string;
  price: string;
  is_available?: boolean;
  is_active?: boolean;
};

type UpdateDishPayload = Partial<CreateDishPayload>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function unwrapData(value: unknown): unknown {
  if (isRecord(value) && value.data !== undefined) {
    return value.data;
  }

  return value;
}

function readTrimmedString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
}

function parseBoolean(value: unknown, fallback: boolean) {
  if (value === undefined || value === null) return fallback;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") return true;
    if (normalized === "false" || normalized === "0") return false;
  }
  return Boolean(value);
}

function normalizeDish(item: unknown): Dish {
  const api = isRecord(item) ? item : {};

  const descriptionValue = api.description ?? api.descriptionText;

  return {
    id: String(api.id ?? ""),
    restaurantId: String(api.restaurant_id ?? api.restaurantId ?? ""),
    name: typeof api.name === "string" ? api.name : "",
    description: readTrimmedString(descriptionValue),
    price: typeof api.price === "string" ? api.price : String(api.price ?? ""),
    isAvailable: parseBoolean(api.is_available ?? api.isAvailable, true),
    isActive: parseBoolean(api.is_active ?? api.isActive, true),
  };
}

export async function getPublicDishesByRestaurant(
  restaurantId: string
): Promise<Dish[]> {
  if (!restaurantId) return [];

  const result = await httpClient.get<unknown>(
    `/dishes/restaurant/${encodeURIComponent(restaurantId)}`
  );

  const payload = unwrapData(result);
  const list = Array.isArray(payload) ? payload : [];

  return list
    .map(normalizeDish)
    .filter((dish) => Boolean(dish.id) && Boolean(dish.name));
}

export async function createDish(
  accessToken: string,
  payload: CreateDishPayload
): Promise<Dish> {
  const result = await httpClient.post<unknown>("/dishes", payload, {
    accessToken,
  });

  return normalizeDish(unwrapData(result));
}

export async function getManagerDishes(accessToken: string): Promise<Dish[]> {
  const result = await httpClient.get<unknown>("/dishes", {
    accessToken,
  });

  const payload = unwrapData(result);
  const list = Array.isArray(payload) ? payload : [];

  return list
    .map(normalizeDish)
    .filter((dish) => Boolean(dish.id) && Boolean(dish.name));
}

export async function updateDish(
  accessToken: string,
  dishId: string,
  payload: UpdateDishPayload
): Promise<Dish> {
  const result = await httpClient.patch<unknown>(
    `/dishes/${encodeURIComponent(dishId)}`,
    payload,
    {
      accessToken,
    }
  );

  return normalizeDish(unwrapData(result));
}

export async function deleteDish(
  accessToken: string,
  dishId: string
): Promise<{ message?: string }> {
  const result = await httpClient.delete<unknown>(
    `/dishes/${encodeURIComponent(dishId)}`,
    {
      accessToken,
    }
  );

  const payload = unwrapData(result);
  if (!isRecord(payload)) {
    return {};
  }

  const message = readTrimmedString(payload.message);
  if (!message) {
    return {};
  }

  return { message };
}
