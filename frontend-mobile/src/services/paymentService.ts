import { API_URL } from "../constants/api";

const REQUEST_TIMEOUT = 20000;

type ApiEnvelope<T> = {
  message?: string;
  data?: T;
};

type CreatePaymentIntentResponse = {
  clientSecret: string;
  payment_intent_id: string;
};

async function requestWithTimeout<T>(
  endpoint: string,
  options: RequestInit
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(`${API_URL}${endpoint}`,
      {
        ...options,
        signal: controller.signal,
      }
    );

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      const error: any = new Error(result?.message || "Error en la solicitud");
      error.status = response.status;
      throw error;
    }

    return result as T;
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

export async function createPaymentIntent(
  accessToken: string,
  reservationId: string
): Promise<CreatePaymentIntentResponse> {
  const result = await requestWithTimeout<ApiEnvelope<CreatePaymentIntentResponse>>(
    "/payments/create-intent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        reservation_id: reservationId,
      }),
    }
  );

  const payload = (result as any)?.data ?? result;

  return {
    clientSecret: String(payload?.clientSecret ?? ""),
    payment_intent_id: String(payload?.payment_intent_id ?? ""),
  };
}
