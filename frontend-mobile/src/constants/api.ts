const DEFAULT_API_URL = "https://movil-7jh3.onrender.com";
const envApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

export const API_URL = envApiUrl || DEFAULT_API_URL;
export const API_URL_SOURCE = envApiUrl
  ? "EXPO_PUBLIC_API_URL"
  : "fallback";

const wsDebugFlag =
  process.env.EXPO_PUBLIC_ENABLE_WS_DEBUG?.trim().toLowerCase() ?? "";

// Socket.IO usa el mismo origen que la API en este proyecto.
export const SOCKET_URL = API_URL;

export const ENABLE_WS_DEBUG =
  wsDebugFlag === "true" || wsDebugFlag === "1";
