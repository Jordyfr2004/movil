import { API_URL, API_URL_SOURCE } from "../constants/api";
import { httpClient } from "../api";

const SESSION_RESTORE_TIMEOUT_MS = 15000;
const REMOTE_LOGOUT_TIMEOUT_MS = 5000;

export const LOGIN_ENDPOINT = "/auth/login";
const REFRESH_ENDPOINT = "/auth/refresh";
const LOGOUT_ENDPOINT = "/auth/logout";

type UnknownRecord = Record<string, unknown>;

export type AuthErrorKind =
  | "timeout"
  | "red"
  | "401/403"
  | "500"
  | "respuesta-invalida"
  | "unknown";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginSuccessResponse {
  message: string;
  data: {
    user_id: string;
    email: string;
    provider: string;
    role: string;
    access_token: string;
    refresh_token: string;
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

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function readStatus(error: unknown): number | undefined {
  if (!isRecord(error)) {
    return undefined;
  }

  return typeof error.status === "number" ? error.status : undefined;
}

function readMessage(error: unknown): string {
  if (!isRecord(error)) {
    return error instanceof Error && error.message
      ? error.message
      : "No se pudo completar la solicitud";
  }

  if (typeof error.message === "string" && error.message.trim()) {
    return error.message.trim();
  }

  return "No se pudo completar la solicitud";
}

function readKind(error: unknown): string | undefined {
  if (!isRecord(error)) {
    return undefined;
  }

  return typeof error.kind === "string" ? error.kind : undefined;
}

function logAuthServiceDebug(message: string, details?: UnknownRecord) {
  if (!__DEV__) {
    return;
  }

  if (details) {
    console.log(`[auth-service] ${message}`, details);
    return;
  }

  console.log(`[auth-service] ${message}`);
}

export function classifyAuthError(error: unknown): AuthErrorKind {
  const kind = readKind(error);

  if (kind === "invalid-response") {
    return "respuesta-invalida";
  }

  const status = readStatus(error);

  if (status === 401 || status === 403) {
    return "401/403";
  }

  if (status !== undefined && status >= 500) {
    return "500";
  }

  const message = readMessage(error).toLowerCase();

  if (message.includes("tard") || message.includes("timeout")) {
    return "timeout";
  }

  if (
    message.includes("no se pudo conectar") ||
    message.includes("network")
  ) {
    return "red";
  }

  return "unknown";
}

export async function loginRequest(
  payload: LoginPayload
): Promise<LoginSuccessResponse> {
  logAuthServiceDebug("Invocando login", {
    apiUrl: API_URL,
    apiUrlSource: API_URL_SOURCE,
    endpoint: LOGIN_ENDPOINT,
    hasEmail: Boolean(payload.email),
    url: `${API_URL}${LOGIN_ENDPOINT}`,
  });

  return httpClient.post<LoginSuccessResponse>(LOGIN_ENDPOINT, payload);
}

export async function refreshTokenRequest(
  refreshToken: string
): Promise<RefreshTokenResponse> {
  return httpClient.post<RefreshTokenResponse>(
    REFRESH_ENDPOINT,
    {
      refresh_token: refreshToken,
    },
    {
      timeoutMs: SESSION_RESTORE_TIMEOUT_MS,
    }
  );
}

export async function logoutRequest(
  refreshToken: string
): Promise<LogoutResponse> {
  return httpClient.post<LogoutResponse>(
    LOGOUT_ENDPOINT,
    {
      refresh_token: refreshToken,
    },
    {
      timeoutMs: REMOTE_LOGOUT_TIMEOUT_MS,
    }
  );
}
