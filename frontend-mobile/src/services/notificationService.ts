import { httpClient } from "../api";

type UnknownRecord = Record<string, unknown>;

type ApiEnvelope<T> = {
  message?: string;
  data?: T;
};

export type RemoteNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  reservationId: string | null;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
};

function isRecord(
  value: unknown
): value is UnknownRecord {
  return (
    typeof value === "object" &&
    value !== null
  );
}

function unwrapData(
  value: unknown
): unknown {
  if (
    isRecord(value) &&
    value.data !== undefined
  ) {
    return value.data;
  }

  return value;
}

function readString(
  value: unknown
): string {
  return typeof value === "string"
    ? value
    : "";
}

function readNullableString(
  value: unknown
): string | null {
  return typeof value === "string"
    ? value
    : null;
}

function normalizeNotification(
  value: unknown
): RemoteNotification | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = readString(value.id);
  const title = readString(value.title);
  const createdAt = readString(
    value.created_at ??
      value.createdAt
  );

  if (
    !id ||
    !title ||
    !createdAt
  ) {
    return null;
  }

  return {
    id,
    type: readString(value.type),
    title,
    message: readString(value.message),

    reservationId:
      readNullableString(
        value.reservation_id ??
          value.reservationId
      ),

    isRead: Boolean(
      value.is_read ??
        value.isRead
    ),

    createdAt,

    readAt:
      readNullableString(
        value.read_at ??
          value.readAt
      ),
  };
}

export async function getMyNotifications(
  accessToken: string
): Promise<RemoteNotification[]> {
  const result =
    await httpClient.get<
      ApiEnvelope<unknown>
    >(
      "/notifications/my",
      {
        accessToken,
      }
    );

  const payload =
    unwrapData(result);

  const list =
    Array.isArray(payload)
      ? payload
      : [];

  return list
    .map(normalizeNotification)
    .filter(
      (
        notification
      ): notification is RemoteNotification =>
        notification !== null
    );
}

export async function markNotificationAsRead(
  accessToken: string,
  notificationId: string
): Promise<RemoteNotification | null> {
  const result =
    await httpClient.patch<
      ApiEnvelope<unknown>
    >(
      `/notifications/${encodeURIComponent(
        notificationId
      )}/read`,
      undefined,
      {
        accessToken,
      }
    );

  return normalizeNotification(
    unwrapData(result)
  );
}

export async function registerPushDeviceToken(
  accessToken: string,
  token: string
): Promise<void> {
  await httpClient.post<unknown>(
    "/notifications/device-token",
    { token },
    { accessToken }
  );
}