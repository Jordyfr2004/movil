import { API_URL } from "../constants/api";

const REQUEST_TIMEOUT = 20000;

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
  };
}

export interface LogoutResponse {
  message: string;
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

    const result = await response.json();

    if (!response.ok) {
      const error: any = new Error(result?.message || "Error en la solicitud");
      error.status = response.status;
      throw error;
    }

    return result;
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

export async function loginRequest(
  payload: LoginPayload
): Promise<LoginSuccessResponse> {
  return requestWithTimeout<LoginSuccessResponse>("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function refreshTokenRequest(
  refreshToken: string
): Promise<RefreshTokenResponse> {
  return requestWithTimeout<RefreshTokenResponse>("/auth/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      refresh_token: refreshToken,
    }),
  });
}

export async function logoutRequest(
  refreshToken: string
): Promise<LogoutResponse> {
  return requestWithTimeout<LogoutResponse>("/auth/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      refresh_token: refreshToken,
    }),
  });
}