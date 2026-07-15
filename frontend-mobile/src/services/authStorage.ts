import * as SecureStore from "expo-secure-store";

import type { UserProfile } from "./userService";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const AUTH_USER_KEY = "auth_user";
const USER_PROFILE_KEY = "user_profile";

export type StoredAuthUser = {
  user_id: string;
  email: string;
  provider: string;
  role:
    | "student"
    | "admin"
    | "super_admin";
};

export type StoredSession = {
  accessToken: string | null;
  refreshToken: string | null;
  user: StoredAuthUser | null;
  profile: UserProfile | null;
};

function isStoredAuthUser(value: unknown): value is StoredAuthUser {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<StoredAuthUser>;

  return (
    typeof candidate.user_id === "string" &&
    typeof candidate.email === "string" &&
    typeof candidate.provider === "string"
  );
}

function isStoredUserProfile(value: unknown): value is UserProfile {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<UserProfile>;

  return (
    candidate.id === undefined ||
    typeof candidate.id === "string" ||
    typeof candidate.id === "number"
  ) && (
    candidate.fullName === undefined ||
    typeof candidate.fullName === "string"
  ) && (
    candidate.email === undefined ||
    typeof candidate.email === "string"
  ) && (
    candidate.role === undefined ||
    typeof candidate.role === "string"
  ) && (
    candidate.restaurantId === undefined ||
    candidate.restaurantId === null ||
    typeof candidate.restaurantId === "string"
  );
}

export async function saveTokens(accessToken: string, refreshToken: string) {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
}

export async function saveAuthUser(user: StoredAuthUser) {
  await SecureStore.setItemAsync(AUTH_USER_KEY, JSON.stringify(user));
}

export async function saveUserProfile(profile: UserProfile) {
  await SecureStore.setItemAsync(USER_PROFILE_KEY, JSON.stringify(profile));
}

export async function getAccessToken() {
  return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken() {
  return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function getAuthUser(): Promise<StoredAuthUser | null> {
  const rawUser = await SecureStore.getItemAsync(AUTH_USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    const parsedUser: unknown = JSON.parse(rawUser);
    return isStoredAuthUser(parsedUser) ? parsedUser : null;
  } catch {
    return null;
  }
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const rawProfile = await SecureStore.getItemAsync(USER_PROFILE_KEY);

  if (!rawProfile) {
    return null;
  }

  try {
    const parsedProfile: unknown = JSON.parse(rawProfile);
    return isStoredUserProfile(parsedProfile) ? parsedProfile : null;
  } catch {
    return null;
  }
}

export async function getTokens() {
  const accessToken = await getAccessToken();
  const refreshToken = await getRefreshToken();

  return {
    accessToken,
    refreshToken,
  };
}

export async function getStoredSession(): Promise<StoredSession> {
  const [accessToken, refreshToken, user, profile] = await Promise.all([
    getAccessToken(),
    getRefreshToken(),
    getAuthUser(),
    getUserProfile(),
  ]);

  return {
    accessToken,
    refreshToken,
    user,
    profile,
  };
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  await SecureStore.deleteItemAsync(AUTH_USER_KEY);
  await SecureStore.deleteItemAsync(USER_PROFILE_KEY);
}
