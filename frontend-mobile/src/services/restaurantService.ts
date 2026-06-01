import { httpClient } from "../api";
import { Restaurant } from "../types/models";

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
  const result = await httpClient.get<any>("/restaurants");

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
  const result = await httpClient.post<RestaurantCreateResponse>(
    "/restaurants",
    payload,
    {
      accessToken,
    }
  );

  const created = (result as any)?.data ?? result;
  return normalizeRestaurant(created);
}

export async function getRestaurantById(
  restaurantId: string
): Promise<Restaurant | null> {
  if (!restaurantId) return null;

  const result = await httpClient.get<any>(
    `/restaurants/${encodeURIComponent(restaurantId)}`
  );

  const payload = (result as any)?.data ?? result;
  const normalized = normalizeRestaurant(payload);

  if (!normalized?.id || !normalized?.name) return null;
  return normalized;
}
