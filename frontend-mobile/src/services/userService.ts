import { httpClient } from "../api";
import { UserRole } from "../types/models";

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

export async function getMyProfile(accessToken: string): Promise<UserProfile> {
  const result = await httpClient.get<UserProfileResponse>("/users/me", {
    accessToken,
  });

  return normalizeUserProfile((result as any)?.data ?? result);
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
