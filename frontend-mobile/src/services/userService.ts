import { API_URL } from "../constants/api";
import { UserRole } from "../types/models";

const REQUEST_TIMEOUT = 20000;

export type UserProfile = {
  id?: string | number;
  fullName?: string;
  email?: string;
  role?: UserRole | string;
  restaurantId?: string | null;
};

export interface UserProfileResponse {
  message?: string;
  data?: any;
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

function normalizeUserProfile(payload: any): UserProfile {
  if (!payload || typeof payload !== "object") return {};

  const fullNameCandidate =
    payload.fullName ??
    payload.full_name ??
    payload.name ??
    (payload.first_name || payload.last_name
      ? `${payload.first_name ?? ""} ${payload.last_name ?? ""}`.trim()
      : undefined);

  return {
    id: payload.id ?? payload.user_id ?? payload.userId,
    fullName:
      typeof fullNameCandidate === "string" ? fullNameCandidate : undefined,
    email: typeof payload.email === "string" ? payload.email : undefined,
    role: normalizeRole(payload.role ?? payload.user_role),
    restaurantId:
      payload.restaurantId ?? payload.restaurant_id ?? payload.restaurant ?? null,
  };
}

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

export async function getMyProfile(accessToken: string): Promise<UserProfile> {
  const result = await requestWithTimeout<UserProfileResponse>("/users/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return normalizeUserProfile((result as any)?.data ?? result);
}

export async function getUserById(
  userId: string,
  accessToken: string
): Promise<UserProfile> {
  const result = await requestWithTimeout<UserProfileResponse>(`/users/${userId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return normalizeUserProfile((result as any)?.data ?? result);
}

export async function getProfileBestEffort(
  accessToken: string,
  userId?: string
): Promise<UserProfile> {
  try {
    return await getMyProfile(accessToken);
  } catch (error: any) {
    const status = error?.status;
    const looksLikeNotFound = status === 404;

    if (!userId || !looksLikeNotFound) {
      throw error;
    }

    return await getUserById(userId, accessToken);
  }
}
