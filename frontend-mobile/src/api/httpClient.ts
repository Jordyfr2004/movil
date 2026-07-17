import { API_URL } from "../constants/api";
import { getRefreshToken, saveTokens } from "../services/authStorage";
import { notifyHttpResponseReceived } from "../services/networkEvents";
import {
  notifyAccessTokenRefreshed,
  notifySessionExpired,
} from "../services/sessionExpiryService";
import { ApiError, isApiError } from "./apiError";

const DEFAULT_TIMEOUT_MS = 20000;
const DEFAULT_ERROR_MESSAGE = "No se pudo completar la solicitud";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
type RequestBody = BodyInit | object | null | undefined;
type UnknownRecord = Record<string, unknown>;

export type HttpRequestOptions = {
  accessToken?: string | null;
  headers?: HeadersInit;
  body?: RequestBody;
  timeoutMs?: number;
  skipAuthRefresh?: boolean;
  retryOnUnauthorized?: boolean;
};

type RefreshTokenPayload = {
  data?: {
    access_token?: unknown;
    refresh_token?: unknown;
  };
};

const REFRESH_ENDPOINT = "/auth/refresh";
const SESSION_RESTORE_TIMEOUT_MS = 15000;

let refreshSessionPromise: Promise<string | null> | null = null;

function logHttpDebug(message: string, details?: UnknownRecord) {
  if (!__DEV__) {
    return;
  }

  if (details) {
    console.log(`[http] ${message}`, details);
    return;
  }

  console.log(`[http] ${message}`);
}

function classifyRequestError(error: unknown): string {
  if (isApiError(error)) {
    if (error.status === 401 || error.status === 403) {
      return "401/403";
    }

    if (error.status !== undefined && error.status >= 500) {
      return "500";
    }

    const message = error.message.toLowerCase();

    if (message.includes("tard") || message.includes("timeout")) {
      return "timeout";
    }

    if (
      message.includes("no se pudo conectar") ||
      message.includes("network")
    ) {
      return "red";
    }
  }

  if ((error as { name?: string } | null)?.name === "AbortError") {
    return "timeout";
  }

  const message =
    error instanceof Error ? error.message.toLowerCase() : DEFAULT_ERROR_MESSAGE;

  if (
    message.includes("no se pudo conectar") ||
    message.includes("network")
  ) {
    return "red";
  }

  return "unknown";
}

function isBodyInit(value: RequestBody): value is BodyInit {
  if (value == null) return false;
  if (typeof value === "string") return true;
  if (typeof FormData !== "undefined" && value instanceof FormData) return true;
  if (typeof Blob !== "undefined" && value instanceof Blob) return true;
  if (
    typeof URLSearchParams !== "undefined" &&
    value instanceof URLSearchParams
  ) {
    return true;
  }
  if (
    typeof ArrayBuffer !== "undefined" &&
    (value instanceof ArrayBuffer || ArrayBuffer.isView(value))
  ) {
    return true;
  }
  return false;
}

function extractErrorMessage(payload: unknown): string {
  if (!payload) return DEFAULT_ERROR_MESSAGE;

  if (typeof payload === "string") {
    const message = payload.trim();
    return message || DEFAULT_ERROR_MESSAGE;
  }

  if (typeof payload === "object") {
    const candidate = payload as {
      message?: unknown;
      error?: unknown;
    };

    if (typeof candidate.message === "string" && candidate.message.trim()) {
      return candidate.message.trim();
    }

    if (
      Array.isArray(candidate.message) &&
      candidate.message.every((item) => typeof item === "string")
    ) {
      const message = candidate.message.join(", ").trim();
      if (message) return message;
    }

    if (typeof candidate.error === "string" && candidate.error.trim()) {
      return candidate.error.trim();
    }
  }

  return DEFAULT_ERROR_MESSAGE;
}

function isTokenExpiredMessage(message: string): boolean {
  const normalized = message
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return (
    normalized.includes("token invalido") ||
    normalized.includes("token invalid") ||
    normalized.includes("invalid token") ||
    normalized.includes("token expirado") ||
    normalized.includes("token expired") ||
    normalized.includes("jwt expired") ||
    normalized.includes("unauthorized") ||
    normalized.includes("no autorizado") ||
    normalized.includes("sesion expiro") ||
    normalized.includes("sesion ha expirado")
  );
}

function isSessionExpiredResponse(error: ApiError): boolean {
  if (error.status === 401 || error.statusCode === 401) {
    return true;
  }

  return isTokenExpiredMessage(error.message);
}

function getFriendlyHttpMessage(status: number, fallback: string): string {
  switch (status) {
    case 400:
      return fallback || "Revisa los datos e inténtalo nuevamente.";
    case 401:
      return "Tu sesión ha expirado. Inicia sesión nuevamente para continuar.";
    case 403:
      return "No tienes permiso para realizar esta acción.";
    case 404:
      return "No encontramos la información solicitada.";
    case 409:
      return "La acción no pudo completarse porque hay un conflicto con el estado actual.";
    case 422:
      return "Revisa los datos ingresados antes de continuar.";
    case 429:
      return "Has realizado demasiados intentos. Espera un momento e inténtalo otra vez.";
    default:
      if (status >= 500) {
        return "El servidor no respondió correctamente. Inténtalo nuevamente más tarde.";
      }
      return fallback || DEFAULT_ERROR_MESSAGE;
  }
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function readRefreshResponseTokens(payload: unknown) {
  const data =
    typeof payload === "object" && payload !== null
      ? (payload as RefreshTokenPayload).data
      : undefined;

  const accessToken = data?.access_token;
  const refreshToken = data?.refresh_token;

  if (typeof accessToken !== "string" || typeof refreshToken !== "string") {
    throw new ApiError("Respuesta inválida al renovar la sesión");
  }

  return {
    accessToken,
    refreshToken,
  };
}

async function requestTokenRefresh(): Promise<string | null> {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    SESSION_RESTORE_TIMEOUT_MS
  );

  try {
    const response = await fetch(`${API_URL}${REFRESH_ENDPOINT}`, {
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json" }),
      body: JSON.stringify({ refresh_token: refreshToken }),
      signal: controller.signal,
    });

    const payload = await parseResponseBody(response);

    if (!response.ok) {
      const statusCode =
        typeof payload === "object" &&
        payload !== null &&
        typeof (payload as { statusCode?: unknown }).statusCode === "number"
          ? (payload as { statusCode: number }).statusCode
          : response.status;
      const message = extractErrorMessage(payload);

      throw new ApiError(getFriendlyHttpMessage(response.status, message), {
        status: response.status,
        statusCode,
        payload,
      });
    }

    const tokens = readRefreshResponseTokens(payload);
    await saveTokens(tokens.accessToken, tokens.refreshToken);
    notifyAccessTokenRefreshed(tokens.accessToken);

    return tokens.accessToken;
  } finally {
    clearTimeout(timeout);
  }
}

function refreshSessionOnce() {
  if (!refreshSessionPromise) {
    refreshSessionPromise = requestTokenRefresh().finally(() => {
      refreshSessionPromise = null;
    });
  }

  return refreshSessionPromise;
}

function buildHeaders(
  headers?: HeadersInit,
  accessToken?: string | null,
  body?: RequestBody
): Headers {
  const nextHeaders = new Headers(headers);

  if (accessToken) {
    nextHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  if (body != null && !isBodyInit(body) && !nextHeaders.has("Content-Type")) {
    nextHeaders.set("Content-Type", "application/json");
  }

  return nextHeaders;
}

function buildBody(body?: RequestBody): BodyInit | undefined {
  if (body == null) return undefined;
  if (isBodyInit(body)) return body;
  return JSON.stringify(body);
}

async function request<T>(
  method: HttpMethod,
  endpoint: string,
  options: HttpRequestOptions = {}
): Promise<T> {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const url = `${API_URL}${endpoint}`;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  logHttpDebug("Request start", {
    baseUrl: API_URL,
    endpoint,
    method,
    timeoutMs,
    url,
  });

  try {
    const response = await fetch(url, {
      method,
      headers: buildHeaders(options.headers, options.accessToken, options.body),
      body: buildBody(options.body),
      signal: controller.signal,
    });

    notifyHttpResponseReceived();

    const payload = await parseResponseBody(response);

    if (!response.ok) {
      const statusCode =
        typeof payload === "object" &&
        payload !== null &&
        typeof (payload as { statusCode?: unknown }).statusCode === "number"
          ? (payload as { statusCode: number }).statusCode
          : response.status;

      const extractedMessage = extractErrorMessage(payload);
      const apiError = new ApiError(
        getFriendlyHttpMessage(response.status, extractedMessage),
        {
        status: response.status,
        statusCode,
        payload,
        }
      );

      if (
        isSessionExpiredResponse(apiError) &&
        !options.skipAuthRefresh &&
        options.retryOnUnauthorized !== false &&
        options.accessToken
      ) {
        try {
          const nextAccessToken = await refreshSessionOnce();

          if (nextAccessToken) {
            return await request<T>(method, endpoint, {
              ...options,
              accessToken: nextAccessToken,
              retryOnUnauthorized: false,
            });
          }

          notifySessionExpired();
        } catch (refreshError: unknown) {
          if (
            isApiError(refreshError) &&
            (refreshError.status === 401 ||
              refreshError.status === 403 ||
              refreshError.statusCode === 401 ||
              refreshError.statusCode === 403)
          ) {
            notifySessionExpired();
          }

          throw apiError;
        }
      } else if (isSessionExpiredResponse(apiError) && options.skipAuthRefresh) {
        notifySessionExpired();
      }

      logHttpDebug("Request failed", {
        endpoint,
        kind: classifyRequestError(apiError),
        message: apiError.message,
        method,
        status: apiError.status ?? -1,
        statusCode: apiError.statusCode ?? -1,
        url,
      });

      throw apiError;
    }

    return payload as T;
  } catch (error: unknown) {
    if (isApiError(error)) {
      logHttpDebug("Request failed", {
        endpoint,
        kind: classifyRequestError(error),
        message: error.message,
        method,
        status: error.status ?? -1,
        statusCode: error.statusCode ?? -1,
        url,
      });
      throw error;
    }

    if ((error as { name?: string })?.name === "AbortError") {
      const apiError = new ApiError("El servidor tardó demasiado en responder", {
        cause: error,
      });

      logHttpDebug("Request failed", {
        endpoint,
        kind: "timeout",
        message: apiError.message,
        method,
        url,
      });

      throw apiError;
    }

    const message =
      error instanceof Error ? error.message : DEFAULT_ERROR_MESSAGE;

    if (
      message.includes("Network request failed") ||
      message.toLowerCase().includes("network")
    ) {
      const apiError = new ApiError("No se pudo conectar con el servidor", {
        cause: error,
      });

      logHttpDebug("Request failed", {
        endpoint,
        kind: "red",
        message: apiError.message,
        method,
        url,
      });

      throw apiError;
    }

    const apiError = new ApiError(message || DEFAULT_ERROR_MESSAGE, {
      cause: error,
    });

    logHttpDebug("Request failed", {
      endpoint,
      kind: classifyRequestError(apiError),
      message: apiError.message,
      method,
      url,
    });

    throw apiError;
  } finally {
    clearTimeout(timeout);
  }
}

export const httpClient = {
  request,
  get<T>(endpoint: string, options?: Omit<HttpRequestOptions, "body">) {
    return request<T>("GET", endpoint, options);
  },
  post<T>(
    endpoint: string,
    body?: RequestBody,
    options?: Omit<HttpRequestOptions, "body">
  ) {
    return request<T>("POST", endpoint, { ...options, body });
  },
  patch<T>(
    endpoint: string,
    body?: RequestBody,
    options?: Omit<HttpRequestOptions, "body">
  ) {
    return request<T>("PATCH", endpoint, { ...options, body });
  },
  put<T>(
    endpoint: string,
    body?: RequestBody,
    options?: Omit<HttpRequestOptions, "body">
  ) {
    return request<T>("PUT", endpoint, { ...options, body });
  },
  delete<T>(endpoint: string, options?: Omit<HttpRequestOptions, "body">) {
    return request<T>("DELETE", endpoint, options);
  },
};
