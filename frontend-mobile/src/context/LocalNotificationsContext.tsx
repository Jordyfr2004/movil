import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";

import {
  getMyNotifications,
  markNotificationAsRead,
} from "../services/notificationService";
import type { RemoteNotification } from "../services/notificationService";

const NOTIFICATIONS_STORAGE_KEY =
  "student_notifications_v1";

const MAX_NOTIFICATIONS = 80;

export type LocalNotificationKind =
  | "reservation_status"
  | "delivered"
  | "pending_payment"
  | "error"
  | "notice";

export type NotificationSource =
  | "local"
  | "remote";

export type LocalNotification = {
  id: string;
  kind: LocalNotificationKind;
  title: string;
  message?: string;
  reservationId?: string;
  createdAt: string;
  read: boolean;
  source: NotificationSource;
};

type AddNotificationInput = Omit<
  LocalNotification,
  "id" | "createdAt" | "read" | "source"
>;

type LocalNotificationsContextValue = {
  notifications: LocalNotification[];
  unreadCount: number;
  isHydrated: boolean;
  isRefreshing: boolean;

  addNotification: (
    notification: AddNotificationInput
  ) => void;

  addRemoteNotification: (
    notification: RemoteNotification
  ) => void;

  refreshNotifications: (
    accessToken: string
  ) => Promise<void>;

  markAsRead: (
    id: string,
    accessToken?: string | null
  ) => Promise<void>;

  markAllAsRead: (
    accessToken?: string | null
  ) => Promise<void>;
};

const LocalNotificationsContext =
  createContext<LocalNotificationsContextValue | null>(
    null
  );

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null
  );
}

function isNotificationKind(
  value: unknown
): value is LocalNotificationKind {
  return (
    value === "reservation_status" ||
    value === "delivered" ||
    value === "pending_payment" ||
    value === "error" ||
    value === "notice"
  );
}

function sanitizeNotifications(
  value: unknown
): LocalNotification[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(
      (
        item
      ): LocalNotification | null => {
        if (!isRecord(item)) {
          return null;
        }

        if (
          typeof item.id !== "string" ||
          typeof item.title !== "string" ||
          typeof item.createdAt !== "string" ||
          typeof item.read !== "boolean"
        ) {
          return null;
        }

        return {
          id: item.id,

          kind: isNotificationKind(
            item.kind
          )
            ? item.kind
            : "notice",

          title: item.title,

          message:
            typeof item.message === "string"
              ? item.message
              : undefined,

          reservationId:
            typeof item.reservationId ===
            "string"
              ? item.reservationId
              : undefined,

          createdAt: item.createdAt,
          read: item.read,

          source:
            item.source === "remote"
              ? "remote"
              : "local",
        };
      }
    )
    .filter(
      (
        item
      ): item is LocalNotification =>
        item !== null
    );
}

function getRemoteNotificationKind(
  type: string
): LocalNotificationKind {
  const normalized =
    type.trim().toUpperCase();

  if (
    normalized ===
    "RESERVATION_DELIVERED"
  ) {
    return "delivered";
  }

  if (
    normalized.includes(
      "RESERVATION"
    )
  ) {
    return "reservation_status";
  }

  return "notice";
}

function convertRemoteNotification(
  notification: RemoteNotification
): LocalNotification {
  return {
    id: notification.id,

    kind: getRemoteNotificationKind(
      notification.type
    ),

    title: notification.title,

    message:
      notification.message ||
      undefined,

    reservationId:
      notification.reservationId ||
      undefined,

    createdAt:
      notification.createdAt,

    read: notification.isRead,

    source: "remote",
  };
}

function getNotificationKey(
  notification: Pick<
    LocalNotification,
    "kind" | "reservationId" | "title"
  >
): string {
  return [
    notification.kind,
    notification.reservationId ?? "",
    notification.title,
  ].join(":");
}

function sortNotifications(
  list: LocalNotification[]
): LocalNotification[] {
  return [...list]
    .sort(
      (first, second) =>
        new Date(
          second.createdAt
        ).getTime() -
        new Date(
          first.createdAt
        ).getTime()
    )
    .slice(
      0,
      MAX_NOTIFICATIONS
    );
}

function mergeRemoteNotifications(
  current: LocalNotification[],
  remote: RemoteNotification[]
): LocalNotification[] {
  const convertedRemote =
    remote.map(
      convertRemoteNotification
    );

  const remoteKeys = new Set(
    convertedRemote.map(
      getNotificationKey
    )
  );

  const localNotifications =
    current.filter(
      (notification) => {
        if (
          notification.source ===
          "remote"
        ) {
          return false;
        }

        return !remoteKeys.has(
          getNotificationKey(
            notification
          )
        );
      }
    );

  return sortNotifications([
    ...convertedRemote,
    ...localNotifications,
  ]);
}

export function LocalNotificationsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    notifications,
    setNotifications,
  ] = useState<
    LocalNotification[]
  >([]);

  const [
    isHydrated,
    setIsHydrated,
  ] = useState(false);

  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false);

  const notificationsRef =
    useRef<LocalNotification[]>([]);

  const refreshInFlightRef =
    useRef(false);

  useEffect(() => {
    notificationsRef.current =
      notifications;
  }, [notifications]);

  useEffect(() => {
    let mounted = true;

    SecureStore.getItemAsync(
      NOTIFICATIONS_STORAGE_KEY
    )
      .then((raw) => {
        if (
          !raw ||
          !mounted
        ) {
          return;
        }

        const parsed: unknown =
          JSON.parse(raw);

        setNotifications(
          sanitizeNotifications(
            parsed
          )
        );
      })
      .catch(() => undefined)
      .finally(() => {
        if (mounted) {
          setIsHydrated(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    SecureStore.setItemAsync(
      NOTIFICATIONS_STORAGE_KEY,
      JSON.stringify(
        notifications.slice(
          0,
          MAX_NOTIFICATIONS
        )
      )
    ).catch(() => undefined);
  }, [
    isHydrated,
    notifications,
  ]);

  const addNotification =
    useCallback(
      (
        notification:
          AddNotificationInput
      ) => {
        const key =
          getNotificationKey(
            notification
          );

        setNotifications(
          (previous) => {
            const hasRemoteDuplicate =
              previous.some(
                (item) =>
                  item.source ===
                    "remote" &&
                  getNotificationKey(
                    item
                  ) === key
              );

            if (
              hasRemoteDuplicate
            ) {
              return previous;
            }

            const withoutDuplicate =
              previous.filter(
                (item) =>
                  !(
                    item.source ===
                      "local" &&
                    getNotificationKey(
                      item
                    ) === key
                  )
              );

            const newNotification:
              LocalNotification = {
              ...notification,

              id: `local-${Date.now()}-${Math.random()
                .toString(16)
                .slice(2)}`,

              createdAt:
                new Date().toISOString(),

              read: false,
              source: "local",
            };

            return sortNotifications([
              newNotification,
              ...withoutDuplicate,
            ]);
          }
        );
      },
      []
    );

  const addRemoteNotification =
    useCallback(
      (
        notification:
          RemoteNotification
      ) => {
        const converted =
          convertRemoteNotification(
            notification
          );

        const key =
          getNotificationKey(
            converted
          );

        setNotifications(
          (previous) => {
            const withoutDuplicate =
              previous.filter(
                (item) => {
                  if (
                    item.id ===
                    converted.id
                  ) {
                    return false;
                  }

                  if (
                    item.source ===
                      "local" &&
                    getNotificationKey(
                      item
                    ) === key
                  ) {
                    return false;
                  }

                  return true;
                }
              );

            return sortNotifications([
              converted,
              ...withoutDuplicate,
            ]);
          }
        );
      },
      []
    );

  const refreshNotifications =
    useCallback(
      async (
        accessToken: string
      ) => {
        if (
          !accessToken ||
          refreshInFlightRef.current
        ) {
          return;
        }

        refreshInFlightRef.current =
          true;

        setIsRefreshing(true);

        try {
          const remoteNotifications =
            await getMyNotifications(
              accessToken
            );

          setNotifications(
            (previous) =>
              mergeRemoteNotifications(
                previous,
                remoteNotifications
              )
          );
        } finally {
          refreshInFlightRef.current =
            false;

          setIsRefreshing(false);
        }
      },
      []
    );

  const markAsRead =
    useCallback(
      async (
        id: string,
        accessToken?: string | null
      ) => {
        const notification =
          notificationsRef.current.find(
            (item) =>
              item.id === id
          );

        if (
          !notification ||
          notification.read
        ) {
          return;
        }

        setNotifications(
          (previous) =>
            previous.map((item) =>
              item.id === id
                ? {
                    ...item,
                    read: true,
                  }
                : item
            )
        );

        if (
          notification.source !==
            "remote" ||
          !accessToken
        ) {
          return;
        }

        try {
          await markNotificationAsRead(
            accessToken,
            notification.id
          );
        } catch (error) {
          setNotifications(
            (previous) =>
              previous.map(
                (item) =>
                  item.id === id
                    ? {
                        ...item,
                        read: false,
                      }
                    : item
              )
          );

          throw error;
        }
      },
      []
    );

  const markAllAsRead =
    useCallback(
      async (
        accessToken?: string | null
      ) => {
        const unread =
          notificationsRef.current.filter(
            (item) =>
              !item.read
          );

        if (
          unread.length === 0
        ) {
          return;
        }

        setNotifications(
          (previous) =>
            previous.map(
              (item) => ({
                ...item,
                read: true,
              })
            )
        );

        if (!accessToken) {
          return;
        }

        const remoteUnread =
          unread.filter(
            (item) =>
              item.source ===
              "remote"
          );

        const results =
          await Promise.all(
            remoteUnread.map(
              async (
                notification
              ) => {
                try {
                  await markNotificationAsRead(
                    accessToken,
                    notification.id
                  );

                  return {
                    id:
                      notification.id,
                    success: true,
                  };
                } catch {
                  return {
                    id:
                      notification.id,
                    success: false,
                  };
                }
              }
            )
          );

        const failedIds =
          new Set(
            results
              .filter(
                (result) =>
                  !result.success
              )
              .map(
                (result) =>
                  result.id
              )
          );

        if (
          failedIds.size === 0
        ) {
          return;
        }

        setNotifications(
          (previous) =>
            previous.map((item) =>
              failedIds.has(
                item.id
              )
                ? {
                    ...item,
                    read: false,
                  }
                : item
            )
        );
      },
      []
    );

  const value =
    useMemo<LocalNotificationsContextValue>(
      () => ({
        notifications,

        unreadCount:
          notifications.filter(
            (item) =>
              !item.read
          ).length,

        isHydrated,
        isRefreshing,

        addNotification,
        addRemoteNotification,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
      }),
      [
        addNotification,
        addRemoteNotification,
        isHydrated,
        isRefreshing,
        markAllAsRead,
        markAsRead,
        notifications,
        refreshNotifications,
      ]
    );

  return (
    <LocalNotificationsContext.Provider
      value={value}
    >
      {children}
    </LocalNotificationsContext.Provider>
  );
}

export function useLocalNotifications() {
  const value =
    useContext(
      LocalNotificationsContext
    );

  if (!value) {
    throw new Error(
      "useLocalNotifications must be used within LocalNotificationsProvider"
    );
  }

  return value;
}
