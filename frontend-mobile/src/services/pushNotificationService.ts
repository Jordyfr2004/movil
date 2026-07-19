import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

export const ANDROID_NOTIFICATION_CHANNEL_ID =
  "comedor_updates";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function createAndroidNotificationChannel() {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync(
    ANDROID_NOTIFICATION_CHANNEL_ID,
    {
      name: "Pedidos y reservas",

      description:
        "Notificaciones sobre reservas, pagos y pedidos.",

      importance:
        Notifications.AndroidImportance.MAX,

      sound: "default",

      vibrationPattern: [
        0,
        250,
        250,
        250,
      ],
    }
  );
}

async function requestNotificationPermission(): Promise<boolean> {
  const currentPermission =
    await Notifications.getPermissionsAsync();

  if (
    currentPermission.status ===
    "granted"
  ) {
    return true;
  }

  const requestedPermission =
    await Notifications.requestPermissionsAsync();

  return (
    requestedPermission.status ===
    "granted"
  );
}

export async function registerAndroidPushNotifications(): Promise<
  string | null
> {
  if (Platform.OS !== "android") {
    return null;
  }

  try {
    await createAndroidNotificationChannel();

    const hasPermission =
      await requestNotificationPermission();

    if (!hasPermission) {
      console.warn(
        "[push] El usuario no concedió permiso para notificaciones."
      );

      return null;
    }

    const pushToken =
      await Notifications.getDevicePushTokenAsync();

    if (
      pushToken.type !== "android" ||
      typeof pushToken.data !== "string"
    ) {
      console.warn(
        "[push] Firebase no devolvió un token FCM válido."
      );

      return null;
    }

    const token =
      pushToken.data.trim();

    if (!token) {
      return null;
    }

    if (__DEV__) {
      console.log(
        "[push] Token FCM Android:",
        token
      );
    }

    return token;
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Error desconocido";

    console.warn(
      "[push] No se pudo registrar el dispositivo:",
      message
    );

    return null;
  }
}

export function listenForAndroidPushTokenChanges(
  onTokenChanged: (
    token: string
  ) => void
) {
  return Notifications.addPushTokenListener(
    (pushToken) => {
      if (
        pushToken.type !== "android" ||
        typeof pushToken.data !==
          "string"
      ) {
        return;
      }

      const token =
        pushToken.data.trim();

      if (token) {
        onTokenChanged(token);
      }
    }
  );
}