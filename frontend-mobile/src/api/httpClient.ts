import { API_URL } from "../constants/api";
import { ApiError, isApiError } from "./apiError";

const DEFAULT_TIMEOUT_MS = 20000;
const DEFAULT_ERROR_MESSAGE = "No se pudo completar la solicitud";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
type RequestBody = BodyInit | object | null | undefined;

export type HttpRequestOptions = {
  accessToken?: string | null;
  headers?: HeadersInit;
  body?: RequestBody;
  timeoutMs?: number;
};

function isBodyInit(value: RequestBody): value is BodyInit {
  if (value == null) return false;
  if (typeof value === "string") return true;
  if (typeof FormData !== "undefined" && value instanceof FormData) return true;
  if (typeof Blob !== "undefined" && value instanceof Blob) return true;
  if (typeof URLSearchParams !== "undefined" && value instanceof URLSearchParams) {
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
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  );

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: buildHeaders(options.headers, options.accessToken, options.body),
      body: buildBody(options.body),
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

      throw new ApiError(extractErrorMessage(payload), {
        status: response.status,
        statusCode,
        payload,
      });
    }

    return payload as T;
  } catch (error: unknown) {
    if (isApiError(error)) {
      throw error;
    }

    if ((error as { name?: string })?.name === "AbortError") {
      throw new ApiError("El servidor tardó demasiado en responder", {
        cause: error,
      });
    }

    const message =
      error instanceof Error ? error.message : DEFAULT_ERROR_MESSAGE;

    if (
      message.includes("Network request failed") ||
      message.toLowerCase().includes("network")
    ) {
      throw new ApiError("No se pudo conectar con el servidor", {
        cause: error,
      });
    }

    throw new ApiError(message || DEFAULT_ERROR_MESSAGE, {
      cause: error,
    });
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
