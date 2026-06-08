import { httpClient } from "../api";
import { UserRole } from "../types/models";

type UnknownRecord = Record<string, unknown>;
const PROFILE_REQUEST_TIMEOUT_MS = 15000;

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

function readMessage(error: unknown): string | undefined {
  if (!isRecord(error)) {
    return error instanceof Error ? error.message : undefined;
  }

  return typeof error.message === "string" ? error.message : undefined;
}

function classifyProfileError(error: unknown): string {
  const status = readStatus(error);
  const message = readMessage(error)?.toLowerCase() ?? "";

  if (status === 401 || status === 403) return "401/403";
  if (status === 404) return "404";
  if (status !== undefined && status >= 500) return "server";
  if (message.includes("tard")) return "timeout";
  if (message.includes("no se pudo conectar") || message.includes("network")) {
    return "red";
  }

  return "desconocido";
}

function logProfileDebug(message: string, details?: UnknownRecord) {
  if (!__DEV__) {
    return;
  }

  if (details) {
    console.log(`[profile] ${message}`, details);
    return;
  }

  console.log(`[profile] ${message}`);
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
  logProfileDebug("Solicitando /users/me");

  try {
    const result = await httpClient.get<UserProfileResponse>("/users/me", {
      accessToken,
      timeoutMs: PROFILE_REQUEST_TIMEOUT_MS,
    });

    return normalizeUserProfile(unwrapData(result));
  } catch (error: unknown) {
    logProfileDebug("Falló /users/me", {
      type: classifyProfileError(error),
      status: readStatus(error) ?? -1,
      message: readMessage(error) ?? "Sin mensaje",
    });
    throw error;
  }
}

export async function getUserById(
  userId: string,
  accessToken: string
): Promise<UserProfile> {
  logProfileDebug("Solicitando /users/:id", { userId });

  try {
    const result = await httpClient.get<UserProfileResponse>(
      `/users/${encodeURIComponent(userId)}`,
      {
        accessToken,
        timeoutMs: PROFILE_REQUEST_TIMEOUT_MS,
      }
    );

    return normalizeUserProfile(unwrapData(result));
  } catch (error: unknown) {
    logProfileDebug("Falló /users/:id", {
      userId,
      type: classifyProfileError(error),
      status: readStatus(error) ?? -1,
      message: readMessage(error) ?? "Sin mensaje",
    });
    throw error;
  }
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

    logProfileDebug("Fallback de /users/me a /users/:id", { userId });
    return await getUserById(userId, accessToken);
  }
}
