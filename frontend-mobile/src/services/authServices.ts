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
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Error al iniciar sesion");
  }

  return result;
}