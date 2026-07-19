import React, {useEffect,} from "react";
import type { Socket } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { useLocalNotifications } from "../context/LocalNotificationsContext";
import {acquireNotificationsSocket,releaseNotificationsSocket,} from "../services/notificationsSocket";

type ReservationDeliveredPayload = {
  notification_id?: string;
  id?: string;
  type?: string;
  title?: string;
  message?: string;
  reservation_id?: string;
  status?: string;
  delivery_status?: string;
  delivered_at?: string;
  is_read?: boolean;
  created_at?: string;
  read_at?: string | null;
};

type ServerEvents = {
  reservation_delivered: (
    payload: ReservationDeliveredPayload
  ) => void;
};

type ClientEvents =
  Record<string, never>;

export function NotificationsRealtimeBridge() {
  const { accessToken } = useAuth();

  const {
    addRemoteNotification,
    refreshNotifications,
  } = useLocalNotifications();

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    let isActive = true;

    const synchronizeNotifications = () => {
      void refreshNotifications(
        accessToken
      ).catch(() => undefined);
    };

    synchronizeNotifications();

    const socket =
      acquireNotificationsSocket(
        accessToken
      ) as Socket<
        ServerEvents,
        ClientEvents
      >;

    const handleDelivered = (
      payload: ReservationDeliveredPayload
    ) => {
      if (!isActive) {
        return;
      }

      const notificationId =
        payload.notification_id?.trim() ||
        payload.id?.trim() ||
        "";

      if (!notificationId) {
        synchronizeNotifications();
        return;
      }

      addRemoteNotification({
        id: notificationId,

        type:
          payload.type?.trim() ||
          "RESERVATION_DELIVERED",

        title:
          payload.title?.trim() ||
          "Reserva entregada",

        message:
          payload.message?.trim() ||
          "Tu reserva fue entregada correctamente.",

        reservationId:
          payload.reservation_id?.trim() ||
          null,

        isRead:
          Boolean(payload.is_read),

        createdAt:
          payload.created_at?.trim() ||
          new Date().toISOString(),

        readAt:
          payload.read_at?.trim() ||
          null,
      });
    };

    const handleReconnect = () => {
      if (!isActive) {
        return;
      }

      synchronizeNotifications();
    };

    socket.on(
      "reservation_delivered",
      handleDelivered
    );

    socket.on(
      "connect",
      handleReconnect
    );

    return () => {
      isActive = false;

      socket.off(
        "reservation_delivered",
        handleDelivered
      );

      socket.off(
        "connect",
        handleReconnect
      );

      releaseNotificationsSocket(
        accessToken
      );
    };
  }, [
    accessToken,
    addRemoteNotification,
    refreshNotifications,
  ]);

  return null;
}