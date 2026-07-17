import React, {createContext,useCallback,useContext,useEffect,useMemo,useRef,useState,} from "react";
import { Alert } from "react-native";
import {classifyAuthError,LoginPayload,LoginSuccessResponse,loginRequest,logoutRequest,refreshTokenRequest,} from "../services/authServices";
import {clearTokens,getRefreshToken,getStoredSession,saveAuthUser,saveTokens,} from "../services/authStorage";
import { disconnectNotificationsSocket } from "../services/notificationsSocket";
import {
  registerAccessTokenRefreshedHandler,
  registerSessionExpiredHandler,
} from "../services/sessionExpiryService";


type UnknownRecord = Record<string, unknown>;

type AuthRole =
  | "student"
  | "admin"
  | "super_admin";

interface AuthUser {
  user_id: string;
  email: string;
  provider: string;
  role: AuthRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logoutLocal: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function readStatus(error: unknown): number | undefined {
  if (!isRecord(error)) {
    return undefined;
  }

  return typeof error.status === "number" ? error.status : undefined;
}

function readMessage(error: unknown): string | undefined {
  if (!isRecord(error)) {
    return error instanceof Error ? error.message : undefined;
  }

  return typeof error.message === "string" ? error.message : undefined;
}

function logAuthDebug(message: string, details?: UnknownRecord) {
  if (!__DEV__) {
    return;
  }

  if (details) {
    console.log(`[auth] ${message}`, details);
    return;
  }

  console.log(`[auth] ${message}`);
}

function normalizeRole(role: string): AuthRole {
  const normalizedRole =
    role.trim().toUpperCase();

  if (normalizedRole === "SUPER_ADMIN") {
    return "super_admin";
  }

  if (
    normalizedRole === "MANAGER" ||
    normalizedRole === "ADMIN"
  ) {
    return "admin";
  }

  return "student";
}

function isLoginResponseData(
  value: unknown
): value is LoginSuccessResponse["data"] {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.access_token === "string" &&
    typeof value.refresh_token === "string" &&
    typeof value.user_id === "string" &&
    typeof value.email === "string" &&
    typeof value.provider === "string" &&
    typeof value.role === "string"
  );
}

function createInvalidLoginResponseError(): Error & { kind: "invalid-response" } {
  const error = new Error(
    "Respuesta inválida del servidor al iniciar sesión."
  ) as Error & { kind: "invalid-response" };

  error.kind = "invalid-response";
  return error;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isHandlingExpiredSessionRef = useRef(false);

  const resetSessionState = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setIsLoading(false);
  }, []);

  const clearLocalSession = useCallback(async () => {
    resetSessionState();
    await clearTokens();
  }, [resetSessionState]);

  const restoreSession = useCallback(async () => {
    let storedAccessToken: string | null = null;

    try {
      const session = await getStoredSession();
      storedAccessToken = session.accessToken;

      if (!session.accessToken && !session.refreshToken) {
        if (session.user) {
          await clearTokens();
        }

        logAuthDebug("No se encontraron tokens guardados", {
          hadStoredUser: Boolean(session.user),
        });
        resetSessionState();
        return;
      }

      if (session.user) {
        setUser(session.user);
      }

      if (session.accessToken) {
        setAccessToken(session.accessToken);
        logAuthDebug("Se restauró accessToken desde almacenamiento", {
          hasStoredUser: Boolean(session.user),
        });
      }

      if (!session.refreshToken) {
        logAuthDebug("No se encontró refreshToken guardado", {
          hasAccessToken: Boolean(session.accessToken),
        });
        setIsLoading(false);
        return;
      }

      const response = await refreshTokenRequest(session.refreshToken);
      logAuthDebug("Refresh token respondió correctamente", {
        hasAccessToken: Boolean(response.data.access_token),
        hasRefreshToken: Boolean(response.data.refresh_token),
      });

      setAccessToken(response.data.access_token);
      await saveTokens(response.data.access_token, response.data.refresh_token);
    } catch (error: unknown) {
      const status = readStatus(error);
      logAuthDebug("La restauración de sesión encontró un error", {
        status: status ?? -1,
        message: readMessage(error) ?? "Sin mensaje",
      });

      if (status === 401 || status === 403) {
        await clearLocalSession();
        return;
      }

      if (!storedAccessToken) {
        setUser(null);
        setAccessToken(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [clearLocalSession, resetSessionState]);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  const login = useCallback(async (payload: LoginPayload) => {
    try {
      const response = await loginRequest(payload);

      if (!isLoginResponseData(response.data)) {
        const invalidResponseError = createInvalidLoginResponseError();

        logAuthDebug("El login devolvió una respuesta inválida", {
          kind: classifyAuthError(invalidResponseError),
        });
        throw invalidResponseError;
      }

      const {
        access_token,
        refresh_token,
        user_id,
        email,
        provider,
        role,
      } = response.data;

      const nextUser = {
        user_id,
        email,
        provider,
        role: normalizeRole(role),
      };

      

      setAccessToken(access_token);
      setUser(nextUser);
      setIsLoading(false);
      isHandlingExpiredSessionRef.current = false;
      await Promise.all([
        saveTokens(access_token, refresh_token),
        saveAuthUser(nextUser),
      ])
      logAuthDebug("Login completado correctamente", {
        provider,
        userId: user_id,
      });
    } catch (error: unknown) {
      logAuthDebug("El login falló", {
        kind: classifyAuthError(error),
        message: readMessage(error) ?? "Sin mensaje",
        status: readStatus(error) ?? -1,
      });
      throw error;
    }
  }, []);

  const logoutLocal = useCallback(async () => {
    disconnectNotificationsSocket();
    await clearLocalSession();
  }, [clearLocalSession]);

  const handleExpiredSession = useCallback(async () => {
    if (isHandlingExpiredSessionRef.current) {
      return;
    }

    isHandlingExpiredSessionRef.current = true;
    await logoutLocal();

    Alert.alert(
      "Sesión expirada",
      "Tu sesión ha expirado. Inicia sesión nuevamente para continuar."
    );

    setTimeout(() => {
      isHandlingExpiredSessionRef.current = false;
    }, 1000);
  }, [logoutLocal]);

  useEffect(() => {
    registerSessionExpiredHandler(handleExpiredSession);
    registerAccessTokenRefreshedHandler((nextAccessToken) => {
      setAccessToken(nextAccessToken);
      isHandlingExpiredSessionRef.current = false;
    });

    return () => {
      registerSessionExpiredHandler(null);
      registerAccessTokenRefreshedHandler(null);
    };
  }, [handleExpiredSession]);

  const logout = useCallback(async () => {
    let refreshToken: string | null = null;

    try {
      refreshToken = await getRefreshToken();
    } catch (error: unknown) {
      logAuthDebug("No se pudo leer refreshToken antes del logout", {
        message: readMessage(error) ?? "Sin mensaje",
      });
    }

    const remoteLogoutPromise = refreshToken
      ? logoutRequest(refreshToken)
      : Promise.resolve();

    disconnectNotificationsSocket();
    await clearLocalSession();

    try {
      await remoteLogoutPromise;
      logAuthDebug("Sesión cerrada correctamente");
    } catch (error: unknown) {
      logAuthDebug("No se pudo cerrar la sesión en el backend", {
        status: readStatus(error) ?? -1,
        message: readMessage(error) ?? "Sin mensaje",
      });
    }
  }, [clearLocalSession]);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(accessToken),
      isLoading,
      login,
      logoutLocal,
      logout,
    }),
    [user, accessToken, isLoading, login, logoutLocal, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
}
