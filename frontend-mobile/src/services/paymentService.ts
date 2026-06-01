import { httpClient } from "../api";

type ApiEnvelope<T> = {
  message?: string;
  data?: T;
};

type CreatePaymentIntentResponse = {
  clientSecret: string;
  payment_intent_id: string;
};

export async function createPaymentIntent(
  accessToken: string,
  reservationId: string
): Promise<CreatePaymentIntentResponse> {
  const result = await httpClient.post<ApiEnvelope<CreatePaymentIntentResponse>>(
    "/payments/create-intent",
    {
      reservation_id: reservationId,
    },
    {
      accessToken,
    }
  );

  const payload = (result as any)?.data ?? result;

  return {
    clientSecret: String(payload?.clientSecret ?? ""),
    payment_intent_id: String(payload?.payment_intent_id ?? ""),
  };
}
