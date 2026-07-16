import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";

const NOTIFICATIONS_STORAGE_KEY = "student_notifications_v1";

export type LocalNotificationKind =
  | "reservation_status"
  | "delivered"
  | "pending_payment"
  | "error"
  | "notice";

export type LocalNotification = {
  id: string;
  kind: LocalNotificationKind;
  title: string;
  message?: string;
  reservationId?: string;
  createdAt: string;
  read: boolean;
};

type LocalNotificationsContextValue = {
  notifications: LocalNotification[];
  unreadCount: number;
  addNotification: (
    notification: Omit<LocalNotification, "id" | "createdAt" | "read">
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
};

const LocalNotificationsContext =
  createContext<LocalNotificationsContextValue | null>(null);

function sanitizeNotifications(value: unknown): LocalNotification[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is LocalNotification =>
      typeof item === "object" &&
      item !== null &&
      typeof item.id === "string" &&
      typeof item.kind === "string" &&
      typeof item.title === "string" &&
      typeof item.createdAt === "string" &&
      typeof item.read === "boolean"
  );
}

export function LocalNotificationsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [notifications, setNotifications] = useState<LocalNotification[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    SecureStore.getItemAsync(NOTIFICATIONS_STORAGE_KEY)
      .then((raw) => {
        if (!raw || !mounted) return;
        setNotifications(sanitizeNotifications(JSON.parse(raw)));
      })
      .catch(() => undefined)
      .finally(() => {
        if (mounted) setHydrated(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    SecureStore.setItemAsync(
      NOTIFICATIONS_STORAGE_KEY,
      JSON.stringify(notifications.slice(0, 80))
    ).catch(() => undefined);
  }, [hydrated, notifications]);

  const addNotification = useCallback<
    LocalNotificationsContextValue["addNotification"]
  >((notification) => {
    const key = `${notification.kind}:${notification.reservationId ?? ""}:${
      notification.title
    }`;

    setNotifications((previous) => {
      const withoutDuplicate = previous.filter((item) => {
        const itemKey = `${item.kind}:${item.reservationId ?? ""}:${item.title}`;
        return itemKey !== key;
      });

      return [
        {
          ...notification,
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...withoutDuplicate,
      ].slice(0, 80);
    });
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((previous) =>
      previous.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((previous) =>
      previous.map((item) => ({ ...item, read: true }))
    );
  }, []);

  const value = useMemo<LocalNotificationsContextValue>(
    () => ({
      notifications,
      unreadCount: notifications.filter((item) => !item.read).length,
      addNotification,
      markAsRead,
      markAllAsRead,
    }),
    [addNotification, markAllAsRead, markAsRead, notifications]
  );

  return (
    <LocalNotificationsContext.Provider value={value}>
      {children}
    </LocalNotificationsContext.Provider>
  );
}

export function useLocalNotifications() {
  const value = useContext(LocalNotificationsContext);
  if (!value) {
    throw new Error(
      "useLocalNotifications must be used within LocalNotificationsProvider"
    );
  }
  return value;
}
