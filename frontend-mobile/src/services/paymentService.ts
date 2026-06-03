import { httpClient } from "../api";

type UnknownRecord = Record<string, unknown>;

type ApiEnvelope<T> = {
  message?: string;
  data?: T;
};

type CreatePaymentIntentResponse = {
  clientSecret: string;
  payment_intent_id: string;
};

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function unwrapData(value: unknown): unknown {
  if (isRecord(value) && value.data !== undefined) {
    return value.data;
  }

  return value;
}

function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

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

  const payload = unwrapData(result);
  const source = isRecord(payload) ? payload : {};

  return {
    clientSecret: readString(source.clientSecret),
    payment_intent_id: readString(source.payment_intent_id),
  };
}
