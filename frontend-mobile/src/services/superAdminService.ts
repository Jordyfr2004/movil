import { httpClient } from "../api";

type UnknownRecord = Record<string, unknown>;

export type SuperAdminUserRole =
  | "STUDENT"
  | "MANAGER"
  | "SUPER_ADMIN";

export type SuperAdminUserStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED";

export interface SuperAdminUser {
  id: string;
  fullName: string;
  role: SuperAdminUserRole;
  status: SuperAdminUserStatus;
  isActive: boolean;
  restaurantId: string | null;
  restaurantName: string | null;
}

export interface SuperAdminRestaurant {
  id: string;
  name: string;
  isActive: boolean;
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function unwrapData(value: unknown): unknown {
  let current = value;

  for (let index = 0; index < 2; index += 1) {
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

function normalizeRole(
  value: unknown
): SuperAdminUserRole {
  if (value === "MANAGER") {
    return "MANAGER";
  }

  if (value === "SUPER_ADMIN") {
    return "SUPER_ADMIN";
  }

  return "STUDENT";
}

function normalizeStatus(
  value: unknown,
  isActive: boolean
): SuperAdminUserStatus {
  if (value === "SUSPENDED") {
    return "SUSPENDED";
  }

  if (value === "INACTIVE") {
    return "INACTIVE";
  }

  if (value === "ACTIVE") {
    return "ACTIVE";
  }

  return isActive ? "ACTIVE" : "INACTIVE";
}

function normalizeUser(
  value: unknown
): SuperAdminUser {
  const user = isRecord(value) ? value : {};

  const restaurant = isRecord(user.restaurant)
    ? user.restaurant
    : {};

  const isActive =
    typeof user.is_active === "boolean"
      ? user.is_active
      : user.isActive === true;

  return {
    id:
      typeof user.id === "string"
        ? user.id
        : "",

    fullName:
      typeof user.full_name === "string"
        ? user.full_name
        : typeof user.fullName === "string"
          ? user.fullName
          : "Sin nombre",

    role: normalizeRole(user.role),

    status: normalizeStatus(
      user.status,
      isActive
    ),

    isActive,

    restaurantId:
      typeof user.restaurant_id === "string"
        ? user.restaurant_id
        : typeof user.restaurantId === "string"
          ? user.restaurantId
          : null,

    restaurantName:
      typeof restaurant.name === "string"
        ? restaurant.name
        : typeof user.restaurant_name === "string"
          ? user.restaurant_name
          : typeof user.restaurantName === "string"
            ? user.restaurantName
            : null,
  };
}

function normalizeRestaurant(
  value: unknown
): SuperAdminRestaurant {
  const restaurant = isRecord(value)
    ? value
    : {};

  return {
    id:
      typeof restaurant.id === "string"
        ? restaurant.id
        : "",

    name:
      typeof restaurant.name === "string"
        ? restaurant.name
        : "Sin nombre",

    isActive:
      typeof restaurant.is_active === "boolean"
        ? restaurant.is_active
        : restaurant.isActive === true,
  };
}

export async function getSuperAdminUsers(
  accessToken: string
): Promise<SuperAdminUser[]> {
  const response = await httpClient.get<unknown>(
    "/super-admin/users",
    {
      accessToken,
    }
  );

  const data = unwrapData(response);

  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map(normalizeUser)
    .filter((user) => Boolean(user.id));
}

export async function getSuperAdminRestaurants(
  accessToken: string
): Promise<SuperAdminRestaurant[]> {
  const response = await httpClient.get<unknown>(
    "/super-admin/restaurants",
    {
      accessToken,
    }
  );

  const data = unwrapData(response);

  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map(normalizeRestaurant)
    .filter((restaurant) =>
      Boolean(restaurant.id)
    );
}

export async function createSuperAdminRestaurant(
  accessToken: string,
  payload: {
    name: string;
    is_active: boolean;
  }
) {
  return httpClient.post(
    "/restaurants",
    payload,
    {
      accessToken,
    }
  );
}

export async function updateSuperAdminRestaurantName(
  accessToken: string,
  restaurantId: string,
  name: string
) {
  return httpClient.patch(
    `/restaurants/${encodeURIComponent(
      restaurantId
    )}`,
    {
      name,
    },
    {
      accessToken,
    }
  );
}

export async function updateSuperAdminRestaurantStatus(
  accessToken: string,
  restaurantId: string,
  isActive: boolean
) {
  return httpClient.patch(
    `/restaurants/${encodeURIComponent(
      restaurantId
    )}/status`,
    {
      is_active: isActive,
    },
    {
      accessToken,
    }
  );
}

export async function assignManager(
  accessToken: string,
  userId: string,
  restaurantId: string
) {
  return httpClient.post(
    "/super-admin/assign-manager",
    {
      user_id: userId,
      restaurant_id: restaurantId,
    },
    {
      accessToken,
    }
  );
}

export async function changeUserRole(
  accessToken: string,
  userId: string,
  role: "STUDENT" | "MANAGER"
) {
  return httpClient.patch(
    "/super-admin/users/role",
    {
      user_id: userId,
      role,
    },
    {
      accessToken,
    }
  );
}

export async function changeUserStatus(
  accessToken: string,
  userId: string,
  status: SuperAdminUserStatus
) {
  return httpClient.patch(
    "/super-admin/users/status",
    {
      user_id: userId,
      status,
    },
    {
      accessToken,
    }
  );
}