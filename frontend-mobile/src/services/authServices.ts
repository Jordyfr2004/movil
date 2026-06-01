import { httpClient } from "../api";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginSuccessResponse {
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
    user_id: string;
    email: string;
    provider: string;
  };
}

export interface RefreshTokenResponse {
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
  };
}

export interface LogoutResponse {
  message: string;
}

export async function loginRequest(
  payload: LoginPayload
): Promise<LoginSuccessResponse> {
  return httpClient.post<LoginSuccessResponse>("/auth/login", payload);
}

export async function refreshTokenRequest(
  refreshToken: string
): Promise<RefreshTokenResponse> {
  return httpClient.post<RefreshTokenResponse>("/auth/refresh", {
    refresh_token: refreshToken,
  });
}

export async function logoutRequest(
  refreshToken: string
): Promise<LogoutResponse> {
  return httpClient.post<LogoutResponse>("/auth/logout", {
    refresh_token: refreshToken,
  });
}
