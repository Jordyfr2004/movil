import { httpClient } from "../api";

type UnknownRecord = Record<string, unknown>;

export type SuperAdminUser = {
  id: string;
  fullName: string;
  role: "STUDENT" | "MANAGER" | "SUPER_ADMIN";
  restaurantId: string | null;
  restaurantName?: string;
};

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function normalizeUser(value: unknown): SuperAdminUser {
  const user = isRecord(value) ? value : {};
  const restaurant = isRecord(user.restaurant) ? user.restaurant : {};

  return {
    id: String(user.id ?? ""),
    fullName:
      typeof user.full_name === "string"
        ? user.full_name
        : typeof user.fullName === "string"
          ? user.fullName
          : "Usuario",
    role:
      user.role === "MANAGER" || user.role === "SUPER_ADMIN"
        ? user.role
        : "STUDENT",
    restaurantId:
      typeof user.restaurant_id === "string"
        ? user.restaurant_id
        : typeof user.restaurantId === "string"
          ? user.restaurantId
          : null,
    restaurantName:
      typeof restaurant.name === "string" ? restaurant.name : undefined,
  };
}

export async function getSuperAdminUsers(
  accessToken: string
): Promise<SuperAdminUser[]> {
  const response = await httpClient.get<unknown>("/super-admin/users", {
    accessToken,
  });

  const payload =
    isRecord(response) && response.data !== undefined
      ? response.data
      : response;

  return Array.isArray(payload)
    ? payload.map(normalizeUser).filter((user) => Boolean(user.id))
    : [];
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