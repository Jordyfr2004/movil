import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  loginRequest,
  logoutRequest,
  refreshTokenRequest,
  LoginPayload,
} from "../services/authServices";

import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from "../services/authStorage";

interface AuthUser {
  user_id: string;
  email: string;
  provider: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const restoreSession = async () => {
    try {
      const storedAccessToken = await getAccessToken();
      if (storedAccessToken) {
        setAccessToken(storedAccessToken);
      }

      const refreshToken = await getRefreshToken();

      if (!refreshToken) {
        return;
      }

      const response = await refreshTokenRequest(refreshToken);

      setAccessToken(response.data.access_token);
      await saveTokens(response.data.access_token, refreshToken);
    } catch (error: any) {
      const status = error?.status;

      if (status === 401 || status === 403) {
        await clearTokens();
        setUser(null);
        setAccessToken(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    restoreSession();
  }, []);

  const login = async (payload: LoginPayload) => {
    const response = await loginRequest(payload);

    const {
      access_token,
      refresh_token,
      user_id,
      email,
      provider,
    } = response.data;

    await saveTokens(access_token, refresh_token);

    setAccessToken(access_token);
    setUser({
      user_id,
      email,
      provider,
    });
  };

  const logout = async () => {
    const refreshToken = await getRefreshToken();

    try {
      if (refreshToken) {
        await logoutRequest(refreshToken);
      }
    } finally {
      await clearTokens();
      setUser(null);
      setAccessToken(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(accessToken),
      isLoading,
      login,
      logout,
    }),
    [user, accessToken, isLoading]
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