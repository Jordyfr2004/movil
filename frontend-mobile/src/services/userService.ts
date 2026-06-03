import { httpClient } from "../api";
import { UserRole } from "../types/models";

type UnknownRecord = Record<string, unknown>;

export type UserProfile = {
  id?: string | number;
  fullName?: string;
  email?: string;
  role?: UserRole | string;
  restaurantId?: string | null;
};

export interface UserProfileResponse {
  message?: string;
  data?: unknown;
}

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

function readRestaurantId(value: unknown): string | null {
  if (value === null) return null;
  return typeof value === "string" ? value : null;
}

function readStatus(error: unknown): number | undefined {
  if (!isRecord(error)) return undefined;
  return typeof error.status === "number" ? error.status : undefined;
}

function normalizeRole(value: unknown): UserRole | string | undefined {
  if (typeof value !== "string") return undefined;
  const lower = value.toLowerCase();

  if (lower === "student" || lower === "estudiante") return "student";
  if (lower === "admin" || lower === "administrator" || lower === "administrador")
    return "admin";

  if (lower === "manager" || lower === "gerente" || lower === "encargado")
    return "admin";

  return value;
}

function normalizeUserProfile(payload: unknown): UserProfile {
  if (!isRecord(payload)) return {};

  const fullNameCandidate =
    payload.fullName ??
    payload.full_name ??
    payload.name ??
    (payload.first_name || payload.last_name
      ? `${readString(payload.first_name) ?? ""} ${readString(payload.last_name) ?? ""}`.trim()
      : undefined);

  return {
    id: readId(payload.id ?? payload.user_id ?? payload.userId),
    fullName:
      typeof fullNameCandidate === "string" ? fullNameCandidate : undefined,
    email: readString(payload.email),
    role: normalizeRole(payload.role ?? payload.user_role),
    restaurantId: readRestaurantId(
      payload.restaurantId ?? payload.restaurant_id ?? payload.restaurant ?? null
    ),
  };
}

export async function getMyProfile(accessToken: string): Promise<UserProfile> {
  const result = await httpClient.get<UserProfileResponse>("/users/me", {
    accessToken,
  });

  return normalizeUserProfile(unwrapData(result));
}

export async function getUserById(
  userId: string,
  accessToken: string
): Promise<UserProfile> {
  const result = await httpClient.get<UserProfileResponse>(
    `/users/${encodeURIComponent(userId)}`,
    {
      accessToken,
    }
  );

  return normalizeUserProfile(unwrapData(result));
}

export async function getProfileBestEffort(
  accessToken: string,
  userId?: string
): Promise<UserProfile> {
  try {
    return await getMyProfile(accessToken);
  } catch (error: unknown) {
    const status = readStatus(error);
    const looksLikeNotFound = status === 404;

    if (!userId || !looksLikeNotFound) {
      throw error;
    }

    return await getUserById(userId, accessToken);
  }
}
