import { useEffect, useRef } from "react";
import { ENABLE_WS_DEBUG, SOCKET_URL } from "../constants/api";
import {
  acquireNotificationsSocket,
  releaseNotificationsSocket,
} from "../services/notificationsSocket";
import type { Socket } from "socket.io-client";

type MenuAvailablePayload = {
  restaurant_id: string;
  message: string;
};

type ServerToClientEvents = {
  menu_available: (payload: MenuAvailablePayload) => void;
};

type ClientToServerEvents = Record<string, never>;

type UseSocketDebugOptions = {
  onMenuAvailable?: (payload: MenuAvailablePayload) => void;
  onConnect?: (socketId: string) => void;
  onError?: (message: string) => void;
};

const isSocketDebugEnabled = ENABLE_WS_DEBUG;

function logSocketDebug(...args: Parameters<typeof console.log>) {
  if (!isSocketDebugEnabled) return;
  console.log(...args);
}

export function useSocketDebug(accessToken: string | null): void;
export function useSocketDebug(
  accessToken: string | null,
  options?: UseSocketDebugOptions
): void;
export function useSocketDebug(
  accessToken: string | null,
  options: UseSocketDebugOptions = {}
) {
  const socketRef = useRef<
    Socket<ServerToClientEvents, ClientToServerEvents> | null
  >(null);
  const didNotifyConnect = useRef(false);
  const didNotifyError = useRef(false);
  const optionsRef = useRef<UseSocketDebugOptions>(options);

  optionsRef.current = options;

  useEffect(() => {
    if (!isSocketDebugEnabled) return;
    if (!accessToken) return;

    const socket = acquireNotificationsSocket(accessToken) as Socket<
      ServerToClientEvents,
      ClientToServerEvents
    >;

    socketRef.current = socket;

    socket.on("connect", () => {
      didNotifyError.current = false;
      logSocketDebug("[socket] connected:", { url: SOCKET_URL, id: socket.id });

      if (!didNotifyConnect.current) {
        didNotifyConnect.current = true;
        optionsRef.current.onConnect?.(socket.id ?? "");
      }
    });

    socket.on("connect_error", (error) => {
      logSocketDebug("[socket] connect_error:", error?.message ?? error);
      if (didNotifyError.current) return;
      didNotifyError.current = true;
      optionsRef.current.onError?.(
        error?.message ?? "No se pudo conectar al socket"
      );
    });

    socket.on("disconnect", (reason) => {
      logSocketDebug("[socket] disconnect:", reason);
    });

    socket.on("menu_available", (payload) => {
      logSocketDebug("[socket] menu_available:", payload);
      optionsRef.current.onMenuAvailable?.(payload);
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.off("menu_available");
      socketRef.current = null;
      didNotifyConnect.current = false;
      didNotifyError.current = false;

      releaseNotificationsSocket(accessToken);
    };
  }, [accessToken]);
}
