import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ColorSchemeName, useColorScheme } from "react-native";
import * as SecureStore from "expo-secure-store";
import { DarkTheme, DefaultTheme, Theme } from "@react-navigation/native";

import { designSystem } from "../theme";

const PREFERENCES_STORAGE_KEY = "student_app_preferences_v1";

export type AppearanceMode = "light" | "dark" | "system";

type AppPreferences = {
  appearanceMode: AppearanceMode;
  hasSeenOnboarding: boolean;
  hasSeenStartup: boolean;
};

type AppPreferencesContextValue = AppPreferences & {
  resolvedScheme: Exclude<ColorSchemeName, null>;
  navigationTheme: Theme;
  setAppearanceMode: (mode: AppearanceMode) => void;
  completeOnboarding: () => void;
  completeStartup: () => void;
};

const AppPreferencesContext =
  createContext<AppPreferencesContextValue | null>(null);

function sanitizePreferences(value: unknown): AppPreferences {
  const source =
    typeof value === "object" && value !== null
      ? (value as Partial<AppPreferences>)
      : {};

  return {
    appearanceMode:
      source.appearanceMode === "dark" ||
      source.appearanceMode === "light" ||
      source.appearanceMode === "system"
        ? source.appearanceMode
        : "system",
    hasSeenOnboarding: Boolean(source.hasSeenOnboarding),
    hasSeenStartup: Boolean(source.hasSeenStartup),
  };
}

export function AppPreferencesProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [preferences, setPreferences] = useState<AppPreferences>({
    appearanceMode: "system",
    hasSeenOnboarding: false,
    hasSeenStartup: false,
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    SecureStore.getItemAsync(PREFERENCES_STORAGE_KEY)
      .then((raw) => {
        if (!raw || !mounted) return;
        setPreferences(sanitizePreferences(JSON.parse(raw)));
      })
      .catch(() => undefined)
      .finally(() => {
        if (mounted) setHydrated(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    SecureStore.setItemAsync(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify(preferences)
    ).catch(() => undefined);
  }, [hydrated, preferences]);

  const resolvedScheme = useMemo<"light" | "dark">(() => {
    if (preferences.appearanceMode === "system") {
      return systemScheme === "dark" ? "dark" : "light";
    }
    return preferences.appearanceMode;
  }, [preferences.appearanceMode, systemScheme]);

  const navigationTheme = useMemo<Theme>(() => {
    if (resolvedScheme === "dark") {
      return {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: "#17120D",
          card: "#221A14",
          primary: designSystem.colors.primary,
          text: "#FFF7ED",
          border: "rgba(255,255,255,0.12)",
          notification: designSystem.colors.primary,
        },
      };
    }

    return {
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        background: designSystem.colors.background,
        card: designSystem.colors.surface,
        primary: designSystem.colors.primary,
        text: designSystem.colors.textPrimary,
        border: designSystem.colors.border,
        notification: designSystem.colors.primary,
      },
    };
  }, [resolvedScheme]);

  const setAppearanceMode = useCallback((appearanceMode: AppearanceMode) => {
    setPreferences((previous) => ({ ...previous, appearanceMode }));
  }, []);

  const completeOnboarding = useCallback(() => {
    setPreferences((previous) => ({ ...previous, hasSeenOnboarding: true }));
  }, []);

  const completeStartup = useCallback(() => {
    setPreferences((previous) => ({ ...previous, hasSeenStartup: true }));
  }, []);

  const value = useMemo<AppPreferencesContextValue>(
    () => ({
      ...preferences,
      resolvedScheme,
      navigationTheme,
      setAppearanceMode,
      completeOnboarding,
      completeStartup,
    }),
    [
      completeOnboarding,
      completeStartup,
      navigationTheme,
      preferences,
      resolvedScheme,
      setAppearanceMode,
    ]
  );

  return (
    <AppPreferencesContext.Provider value={value}>
      {children}
    </AppPreferencesContext.Provider>
  );
}

export function useAppPreferences() {
  const value = useContext(AppPreferencesContext);
  if (!value) {
    throw new Error(
      "useAppPreferences must be used within AppPreferencesProvider"
    );
  }
  return value;
}
