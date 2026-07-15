import { httpClient } from "../api";
import { API_URL } from "../constants/api";
import { Restaurant } from "../types/models";

type UnknownRecord = Record<string, unknown>;

export type RestaurantWithImage = Restaurant & {
  imageUrl: string | null;
  imagePath: string | null;
};

export type RestaurantImageFile = {
  uri: string;
  name: string;
  type: string;
};

type RestaurantApi = {
  id: string;
  name: string;
  is_active: boolean;
  image_url?: string | null;
  image_path?: string | null;
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

function isRecord(
  value: unknown
): value is UnknownRecord {
  return (
    typeof value === "object" &&
    value !== null
  );
}

function unwrapData(
  value: unknown
): unknown {
  let current = value;

  for (
    let index = 0;
    index < 3;
    index += 1
  ) {
    if (
      isRecord(current) &&
      current.data !== undefined
    ) {
      current = current.data;
      continue;
    }

    break;
  }

  return current;
}

function readString(
  value: unknown
): string | undefined {
  return typeof value === "string"
    ? value
    : undefined;
}

function readNullableString(
  value: unknown
): string | null {
  return typeof value === "string" &&
    value.trim()
    ? value
    : null;
}

function readId(
  value: unknown
): string | number | undefined {
  return (
    typeof value === "string" ||
    typeof value === "number"
  )
    ? value
    : undefined;
}

function normalizeRestaurant(
  item: unknown
): RestaurantWithImage {
  if (!isRecord(item)) {
    return {
      id: "",
      name: "",
      isActive: false,
      imageUrl: null,
      imagePath: null,
    };
  }

  const isActive = Boolean(
    item.is_active ??
      item.isActive ??
      item.active
  );

  return {
    id: readId(item.id) ?? "",
    name: readString(item.name) ?? "",
    isActive,

    imageUrl: readNullableString(
      item.image_url ??
        item.imageUrl
    ),

    imagePath: readNullableString(
      item.image_path ??
        item.imagePath
    ),

    createdAt: readString(
      item.created_at ??
        item.createdAt
    ),

    updatedAt: readString(
      item.updated_at ??
        item.updatedAt
    ),
  };
}

function readErrorMessage(
  value: unknown
): string {
  if (!isRecord(value)) {
    return "No se pudo subir la imagen del restaurante";
  }

  if (
    typeof value.message === "string"
  ) {
    return value.message;
  }

  if (
    Array.isArray(value.message)
  ) {
    return value.message
      .filter(
        (item): item is string =>
          typeof item === "string"
      )
      .join("\n");
  }

  if (value.data !== undefined) {
    return readErrorMessage(
      value.data
    );
  }

  return "No se pudo subir la imagen del restaurante";
}

function extractImageUrl(
  value: unknown
): string | null {
  const data = unwrapData(value);

  if (!isRecord(data)) {
    return null;
  }

  const directImageUrl =
    readNullableString(
      data.image_url ??
        data.imageUrl
    );

  if (directImageUrl) {
    return directImageUrl;
  }

  if (
    isRecord(data.restaurant)
  ) {
    return readNullableString(
      data.restaurant.image_url ??
        data.restaurant.imageUrl
    );
  }

  return null;
}

export async function getRestaurants(): Promise<
  Restaurant[]
> {
  const result =
    await httpClient.get<unknown>(
      "/restaurants"
    );

  const payload = unwrapData(result);
  const list = Array.isArray(payload)
    ? payload
    : [];

  return list
    .map(normalizeRestaurant)
    .filter(
      (restaurant) =>
        Boolean(restaurant.id) &&
        Boolean(restaurant.name)
    );
}

export async function createRestaurant(
  accessToken: string,
  payload: RestaurantCreatePayload
): Promise<Restaurant> {
  const result =
    await httpClient.post<RestaurantCreateResponse>(
      "/restaurants",
      payload,
      {
        accessToken,
      }
    );

  return normalizeRestaurant(
    unwrapData(result)
  );
}

export async function getRestaurantById(
  restaurantId: string
): Promise<RestaurantWithImage | null> {
  if (!restaurantId) {
    return null;
  }

  const result =
    await httpClient.get<unknown>(
      `/restaurants/${encodeURIComponent(
        restaurantId
      )}`
    );

  const normalized =
    normalizeRestaurant(
      unwrapData(result)
    );

  if (
    !normalized.id ||
    !normalized.name
  ) {
    return null;
  }

  return normalized;
}

export async function uploadMyRestaurantImage(
  accessToken: string,
  image: RestaurantImageFile
): Promise<string | null> {
  const formData = new FormData();

  formData.append(
    "image",
    {
      uri: image.uri,
      name: image.name,
      type: image.type,
    } as unknown as Blob
  );

  const baseUrl =
    API_URL.replace(/\/$/, "");

  let response: Response;

  try {
    response = await fetch(
      `${baseUrl}/restaurants/my/image`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          Authorization:
            `Bearer ${accessToken}`,
        },
        body: formData,
      }
    );
  } catch {
    throw new Error(
      "No se pudo conectar con el servidor"
    );
  }

  const text =
    await response.text();

  let responseBody: unknown = null;

  if (text) {
    try {
      responseBody =
        JSON.parse(text);
    } catch {
      responseBody = {
        message: text,
      };
    }
  }

  if (!response.ok) {
    const error = new Error(
      readErrorMessage(responseBody)
    ) as Error & {
      status?: number;
    };

    error.status =
      response.status;

    throw error;
  }

  return extractImageUrl(
    responseBody
  );
}
