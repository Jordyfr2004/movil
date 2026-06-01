export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "https://movil-7jh3.onrender.com";

// Socket.IO usa el mismo origen que la API en este proyecto.
export const SOCKET_URL = API_URL;

// Solo para pruebas locales: evita “ensuciar” producción.
export const ENABLE_WS_DEBUG = __DEV__;
