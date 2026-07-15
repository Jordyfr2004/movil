import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "../constants/api";

let socketSingleton: Socket | null = null;
let socketToken: string | null = null;
let refCount = 0;

function createSocket(accessToken: string): Socket {
  return io(SOCKET_URL, {
    transports: ["websocket"],
    auth: {
      token: accessToken,
    },
    autoConnect: true,
    reconnection: true,
  });
}

export function acquireNotificationsSocket(accessToken: string): Socket {
  if (!accessToken) {
    throw new Error("accessToken requerido para conectar Socket.IO");
  }

  // Si el token cambió (refresh/login), recreamos la conexión.
  if (!socketSingleton || socketToken !== accessToken) {
    if (socketSingleton) {
      try {
        socketSingleton.disconnect();
      } catch {
        // best-effort
      }
    }

    socketSingleton = createSocket(accessToken);
    socketToken = accessToken;
    refCount = 0;
  }

  refCount += 1;
  return socketSingleton;
}

export function releaseNotificationsSocket(accessToken: string): void {
  if (!socketSingleton) return;
  if (!socketToken) return;
  if (socketToken !== accessToken) return;

  refCount = Math.max(0, refCount - 1);

  if (refCount === 0) {
    try {
      socketSingleton.disconnect();
    } finally {
      socketSingleton = null;
      socketToken = null;
    }
  }
}

export function disconnectNotificationsSocket(): void {
  if (!socketSingleton) {
    return;
  }

  try {
    socketSingleton.removeAllListeners();
    socketSingleton.disconnect();
  } finally {
    socketSingleton = null;
    socketToken = null;
    refCount = 0;
  }
}
