import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { ENABLE_WS_DEBUG, SOCKET_URL } from "../constants/api";

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

export function useSocketDebug(accessToken: string | null): void;
export function useSocketDebug(
  accessToken: string | null,
  options?: UseSocketDebugOptions
): void;
export function useSocketDebug(
  accessToken: string | null,
  options: UseSocketDebugOptions = {}
) {
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const didNotifyConnect = useRef(false);
  const didNotifyError = useRef(false);
  const optionsRef = useRef<UseSocketDebugOptions>(options);

  optionsRef.current = options;

  useEffect(() => {
    if (!ENABLE_WS_DEBUG) return;
    if (!accessToken) return;

    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
      SOCKET_URL,
      {
        transports: ["websocket"],
        auth: {
          token: accessToken,
        },
        autoConnect: true,
        reconnection: true,
      }
    );

    socketRef.current = socket;

    socket.on("connect", () => {
      didNotifyError.current = false;
      console.log("[socket] connected:", { url: SOCKET_URL, id: socket.id });

      if (!didNotifyConnect.current) {
        didNotifyConnect.current = true;
        optionsRef.current.onConnect?.(socket.id ?? "");
      }
    });

    socket.on("connect_error", (error) => {
      console.log("[socket] connect_error:", error?.message ?? error);
      if (didNotifyError.current) return;
      didNotifyError.current = true;
      optionsRef.current.onError?.(
        error?.message ?? "No se pudo conectar al socket"
      );
    });

    socket.on("disconnect", (reason) => {
      // Silencioso para no spamear; dejamos consola para depurar.
      console.log("[socket] disconnect:", reason);
    });

    socket.on("menu_available", (payload) => {
      console.log("[socket] menu_available:", payload);
      optionsRef.current.onMenuAvailable?.(payload);
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.off("menu_available");
      socket.disconnect();
      socketRef.current = null;
      didNotifyConnect.current = false;
      didNotifyError.current = false;
    };
  }, [accessToken]);
}