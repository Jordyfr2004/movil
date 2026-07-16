const DEFAULT_API_URL = "https://movil-7jh3.onrender.com";
const envApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const envWsUrl = process.env.EXPO_PUBLIC_WS_URL?.trim();

export const API_URL = envApiUrl || DEFAULT_API_URL;
export const API_URL_SOURCE = envApiUrl
  ? "EXPO_PUBLIC_API_URL"
  : "fallback";

const wsDebugFlag =
  process.env.EXPO_PUBLIC_ENABLE_WS_DEBUG?.trim().toLowerCase() ?? "";

export const SOCKET_URL = envWsUrl || API_URL;

export const ENABLE_WS_DEBUG =
  wsDebugFlag === "true" || wsDebugFlag === "1";
