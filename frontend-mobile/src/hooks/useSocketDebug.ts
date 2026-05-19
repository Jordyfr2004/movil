import { useEffect, useRef } from "react";
import { Alert } from "react-native";
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

function safeStringify(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function useSocketDebug(accessToken: string | null) {
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const didShowConnectAlert = useRef(false);
  const didShowErrorAlert = useRef(false);

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
      didShowErrorAlert.current = false;

      if (!didShowConnectAlert.current) {
        didShowConnectAlert.current = true;
        Alert.alert(
          "Socket conectado",
          `Conectado a ${SOCKET_URL}\nID: ${socket.id}`
        );
      }
    });

    socket.on("connect_error", (error) => {
      if (didShowErrorAlert.current) return;
      didShowErrorAlert.current = true;

      Alert.alert(
        "Socket error",
        `No se pudo conectar al socket.\n${error?.message ?? "Error desconocido"}`
      );
    });

    socket.on("disconnect", (reason) => {
      // Silencioso para no spamear; dejamos consola para depurar.
      console.log("[socket] disconnect:", reason);
    });

    socket.on("menu_available", (payload) => {
      Alert.alert(
        "Evento socket: menu_available",
        payload?.message || safeStringify(payload)
      );
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.off("menu_available");
      socket.disconnect();
      socketRef.current = null;
      didShowConnectAlert.current = false;
      didShowErrorAlert.current = false;
    };
  }, [accessToken]);
}