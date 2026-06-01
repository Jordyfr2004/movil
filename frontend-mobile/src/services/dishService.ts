import { httpClient } from "../api";

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

  const result = await httpClient.get<any>(
    `/dishes/restaurant/${encodeURIComponent(restaurantId)}`
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
  const result = await httpClient.post<any>("/dishes", payload, {
    accessToken,
  });

  const created = (result as any)?.data ?? result;
  return normalizeDish(created);
}

export async function getManagerDishes(accessToken: string): Promise<Dish[]> {
  const result = await httpClient.get<any>("/dishes", {
    accessToken,
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
  const result = await httpClient.patch<any>(
    `/dishes/${encodeURIComponent(dishId)}`,
    payload,
    {
      accessToken,
    }
  );

  const updated = (result as any)?.data ?? result;
  return normalizeDish(updated);
}

export async function deleteDish(
  accessToken: string,
  dishId: string
): Promise<{ message?: string } | any> {
  return httpClient.delete<any>(`/dishes/${encodeURIComponent(dishId)}`, {
    accessToken,
  });
}
