import React, {
  useEffect,
  useRef,
} from "react";
import { Platform } from "react-native";

import { useAuth } from "../context/AuthContext";
import { registerPushDeviceToken } from "../services/notificationService";
import {
  listenForAndroidPushTokenChanges,
  registerAndroidPushNotifications,
} from "../services/pushNotificationService";

type PendingRegistration = {
  key: string;
  promise: Promise<void>;
};

export function PushNotificationsBridge() {
  const {
    accessToken,
    isAuthenticated,
    user,
  } = useAuth();

  const registeredKeyRef =
    useRef<string | null>(null);

  const pendingRegistrationRef =
    useRef<PendingRegistration | null>(
      null
    );

  useEffect(() => {
    const userId =
      user?.user_id ?? null;

    const canReceivePush =
      user?.role === "student" ||
      user?.role === "admin";

    if (
      Platform.OS !== "android" ||
      !isAuthenticated ||
      !accessToken ||
      !userId ||
      !canReceivePush
    ) {
      registeredKeyRef.current =
        null;

      pendingRegistrationRef.current =
        null;

      return;
    }

    let isActive = true;

    const syncToken =
      async (
        token: string
      ): Promise<void> => {
        const key =
          `${userId}:${token}`;

        if (
          registeredKeyRef.current ===
          key
        ) {
          return;
        }

        const pending =
          pendingRegistrationRef.current;

        if (
          pending?.key === key
        ) {
          try {
            await pending.promise;

            if (isActive) {
              registeredKeyRef.current =
                key;
            }
          } catch {
            return;
          }

          return;
        }

        const promise =
          registerPushDeviceToken(
            accessToken,
            token
          );

        pendingRegistrationRef.current =
          {
            key,
            promise,
          };

        try {
          await promise;

          if (isActive) {
            registeredKeyRef.current =
              key;
          }
        } catch {
          return;
        } finally {
          if (
            pendingRegistrationRef
              .current?.key === key
          ) {
            pendingRegistrationRef.current =
              null;
          }
        }
      };

    const registerDevice =
      async () => {
        const token =
          await registerAndroidPushNotifications();

        if (
          isActive &&
          token
        ) {
          await syncToken(token);
        }
      };

    void registerDevice();

    const subscription =
      listenForAndroidPushTokenChanges(
        (token) => {
          if (isActive) {
            void syncToken(token);
          }
        }
      );

    return () => {
      isActive = false;
      subscription.remove();
    };
  }, [
    accessToken,
    isAuthenticated,
    user?.role,
    user?.user_id,
  ]);

  return null;
}