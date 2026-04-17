import { API_URL } from "../constants/api";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginSuccessResponse {
  message: string;
  access_token?: string;
  data?: {
    access_token?: string;
    user_id?: string;
    email?: string;
    provider?: string;
  };
}

export async function loginRequest(
  payload: LoginPayload
): Promise<LoginSuccessResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "No se pudo iniciar sesión");
    }

    return result;
  } catch (error: any) {
    if (error?.name === "AbortError") {
      throw new Error("El servidor tardó demasiado en responder");
    }

    if (
      error?.message?.includes("Network request failed") ||
      error?.message?.includes("network")
    ) {
      throw new Error("No se pudo conectar con el servidor");
    }

    throw new Error(error?.message || "Ocurrió un error inesperado");
  } finally {
    clearTimeout(timeout);
  }
}