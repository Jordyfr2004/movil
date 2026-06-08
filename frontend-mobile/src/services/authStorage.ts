import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const AUTH_USER_KEY = "auth_user";

export type StoredAuthUser = {
  user_id: string;
  email: string;
  provider: string;
};

export type StoredSession = {
  accessToken: string | null;
  refreshToken: string | null;
  user: StoredAuthUser | null;
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

export async function saveTokens(accessToken: string, refreshToken: string) {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
}

export async function saveAuthUser(user: StoredAuthUser) {
  await SecureStore.setItemAsync(AUTH_USER_KEY, JSON.stringify(user));
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

export async function getTokens() {
  const accessToken = await getAccessToken();
  const refreshToken = await getRefreshToken();

  return {
    accessToken,
    refreshToken,
  };
}

export async function getStoredSession(): Promise<StoredSession> {
  const [accessToken, refreshToken, user] = await Promise.all([
    getAccessToken(),
    getRefreshToken(),
    getAuthUser(),
  ]);

  return {
    accessToken,
    refreshToken,
    user,
  };
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  await SecureStore.deleteItemAsync(AUTH_USER_KEY);
}
