import { httpClient } from "../api";
import { Restaurant } from "../types/models";

type UnknownRecord = Record<string, unknown>;

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

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function unwrapData(value: unknown): unknown {
  if (isRecord(value) && value.data !== undefined) {
    return value.data;
  }

  return value;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function readId(value: unknown): string | number | undefined {
  return typeof value === "string" || typeof value === "number"
    ? value
    : undefined;
}

function normalizeRestaurant(item: unknown): Restaurant {
  if (!isRecord(item)) {
    return {
      id: "",
      name: "",
      isActive: false,
    };
  }

  const isActive = Boolean(item.is_active ?? item.isActive ?? item.active);

  return {
    id: readId(item.id) ?? "",
    name: readString(item.name) ?? "",
    isActive,
    createdAt: readString(item.created_at ?? item.createdAt),
    updatedAt: readString(item.updated_at ?? item.updatedAt),
  };
}

export async function getRestaurants(): Promise<Restaurant[]> {
  const result = await httpClient.get<unknown>("/restaurants");

  const payload = unwrapData(result);
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

  return normalizeRestaurant(unwrapData(result));
}

export async function getRestaurantById(
  restaurantId: string
): Promise<Restaurant | null> {
  if (!restaurantId) return null;

  const result = await httpClient.get<unknown>(
    `/restaurants/${encodeURIComponent(restaurantId)}`
  );

  const normalized = normalizeRestaurant(unwrapData(result));

  if (!normalized?.id || !normalized?.name) return null;
  return normalized;
}
