import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { ENABLE_WS_DEBUG } from "../constants/api";
import { spacing } from "../constants/spacing";
import { useAuth } from "../context/AuthContext";
import {
  AppButton,
  DebugToast,
  ErrorMessage,
  LoadingState,
  Screen,
} from "../components";
import { useSocketDebug } from "../hooks/useSocketDebug";
import { StudentAccessScreen } from "../screens/StudentAccessScreen";
import { WelcomeScreen } from "../screens/WelcomeScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { CreateRestaurantScreen } from "../screens/CreateRestaurantScreen";
import { ManagerProfileScreen } from "../screens/ManagerProfileScreen";
import { AddDishScreen } from "../screens/AddDishScreen";
import { RestaurantDetailScreen } from "../screens/RestaurantDetailScreen";
import { MyReservationsScreen } from "../screens/MyReservationsScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { getUserProfile, saveUserProfile } from "../services/authStorage";
import { getProfileBestEffort, UserProfile } from "../services/userService";
import { colors, typography } from "../theme";
import { ROUTES } from "./routes";
import { AdminDrawerNavigator } from "./AdminDrawerNavigator";
import { StudentDrawerNavigator } from "./StudentDrawerNavigator";
import { RootStackParamList } from "./types";
import RegisterScreen from "../screens/RegisterScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();
const isSocketDebugEnabled = ENABLE_WS_DEBUG;

type UnknownRecord = Record<string, unknown>;
type ProfileLoadErrorKind =
  | "timeout"
  | "network"
  | "server"
  | "not-found"
  | "expired"
  | "unknown";

type ProfileLoadError = {
  kind: ProfileLoadErrorKind;
  message: string;
};

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function readStatus(error: unknown): number | undefined {
  if (!isRecord(error)) {
    return undefined;
  }

  return typeof error.status === "number" ? error.status : undefined;
}

function isExpiredSessionStatus(status: number | undefined) {
  return status === 401 || status === 403;
}

function readMessage(error: unknown): string {
  if (!isRecord(error)) {
    return error instanceof Error && error.message
      ? error.message
      : "No se pudo cargar tu perfil.";
  }

  if (typeof error.message === "string" && error.message.trim()) {
    return error.message.trim();
  }

  return "No se pudo cargar tu perfil.";
}

function logSessionDebug(message: string, details?: UnknownRecord) {
  if (!__DEV__) {
    return;
  }

  if (details) {
    console.log(`[session] ${message}`, details);
    return;
  }

  console.log(`[session] ${message}`);
}

function classifyProfileLoadError(error: unknown): ProfileLoadError {
  const status = readStatus(error);
  const message = readMessage(error);
  const normalizedMessage = message.toLowerCase();

  if (isExpiredSessionStatus(status)) {
    return {
      kind: "expired",
      message: "Tu sesión expiró. Vuelve a iniciar sesión.",
    };
  }

  if (status === 404) {
    return {
      kind: "not-found",
      message: `No pudimos encontrar tu perfil. ${message}`,
    };
  }

  if (status !== undefined && status >= 500) {
    return {
      kind: "server",
      message: `El servidor no respondió correctamente. ${message}`,
    };
  }

  if (
    normalizedMessage.includes("tard") ||
    normalizedMessage.includes("timeout")
  ) {
    return {
      kind: "timeout",
      message: `La carga de tu perfil tardó demasiado. ${message}`,
    };
  }

  if (
    normalizedMessage.includes("no se pudo conectar") ||
    normalizedMessage.includes("network")
  ) {
    return {
      kind: "network",
      message: `No pudimos comunicarnos con el servidor. ${message}`,
    };
  }

  return {
    kind: "unknown",
    message,
  };
}

function isTransientProfileError(error: ProfileLoadError) {
  return error.kind === "timeout" || error.kind === "network";
}

function doesProfileBelongToUser(
  profile: UserProfile,
  user: { user_id: string; email: string } | null
) {
  if (!user) {
    return true;
  }

  const profileId = profile.id === undefined ? "" : String(profile.id);
  const profileEmail = profile.email?.trim().toLowerCase() ?? "";
  const userEmail = user.email.trim().toLowerCase();

  return (
    (!profileId || profileId === user.user_id) &&
    (!profileEmail || profileEmail === userEmail)
  );
}

async function getLocalProfileFallback(
  user: { user_id: string; email: string } | null
): Promise<{
  profile: UserProfile;
  source: "stored-profile" | "stored-user";
} | null> {
  const storedProfile = await getUserProfile();

  if (storedProfile && doesProfileBelongToUser(storedProfile, user)) {
    return {
      profile: storedProfile,
      source: "stored-profile",
    };
  }

  if (!user) {
    return null;
  }

  return {
    profile: {
      id: user.user_id,
      email: user.email,
    },
    source: "stored-user",
  };
}

function InitialLoadingScreen({ message }: { message: string }) {
  return (
    <Screen style={styles.loadingScreen}>
      <LoadingState
        message={message}
        size="large"
        style={styles.loadingState}
      />
    </Screen>
  );
}

function ProfileErrorScreen({
  error,
  isSigningOut,
  onRetry,
  onLogout,
}: {
  error: ProfileLoadError;
  isSigningOut: boolean;
  onRetry: () => void;
  onLogout: () => void;
}) {
  return (
    <Screen style={styles.loadingScreen}>
      <ErrorMessage
        title="No pudimos preparar tu perfil"
        message={error.message}
        onRetry={onRetry}
        retryLabel="Reintentar"
        style={styles.profileErrorCard}
      />

      <AppButton
        label={isSigningOut ? "Cerrando sesión…" : "Cerrar sesión"}
        onPress={onLogout}
        variant="secondary"
        disabled={isSigningOut}
        style={styles.profileErrorAction}
      />
    </Screen>
  );
}

export function AppNavigator() {
  const { isAuthenticated, isLoading, accessToken, logoutLocal, user } =
    useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<ProfileLoadError | null>(
    null
  );
  const [profileRequestKey, setProfileRequestKey] = useState(0);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [debugToast, setDebugToast] = useState<
    { title: string; message?: string } | null
  >(null);
  const isMountedRef = useRef(true);
  const debugToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resolvedProfileKeyRef = useRef<string | null>(null);
  const pendingProfileKeyRef = useRef<string | null>(null);
  const profileKey =
    isAuthenticated && accessToken
      ? `${accessToken}:${user?.user_id ?? ""}`
      : null;
  const currentProfileKeyRef = useRef<string | null>(profileKey);
  currentProfileKeyRef.current = profileKey;

  const hasResolvedCurrentProfile =
    profileKey !== null && resolvedProfileKeyRef.current === profileKey;
  const currentProfile = hasResolvedCurrentProfile ? profile : null;

  const resetProfileResolution = () => {
    resolvedProfileKeyRef.current = null;
    pendingProfileKeyRef.current = null;
  };

  const resetProfileState = () => {
    setProfile(null);
    setProfileError(null);
    setIsProfileLoading(false);
    resetProfileResolution();
  };

  const handleLogout = () => {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    resetProfileState();

    void logoutLocal()
      .catch(() => undefined)
      .finally(() => {
        if (!isMountedRef.current) {
          return;
        }

        resetProfileState();
        setIsSigningOut(false);
      });
  };

  const retryProfileLoad = () => {
    if (!profileKey || isProfileLoading) {
      return;
    }

    logSessionDebug("Reintentando carga de perfil", {
      hasUserId: Boolean(user?.user_id),
    });
    setProfileError(null);
    resetProfileResolution();
    setProfileRequestKey((value) => value + 1);
  };

  const showDebugToast = (title: string, message?: string) => {
    if (!isSocketDebugEnabled) {
      return;
    }

    setDebugToast({ title, message });

    if (debugToastTimerRef.current) {
      clearTimeout(debugToastTimerRef.current);
    }

    debugToastTimerRef.current = setTimeout(() => {
      setDebugToast(null);
      debugToastTimerRef.current = null;
    }, 120_000);
  };

  useSocketDebug(accessToken, {
    onMenuAvailable: (payload) => {
      showDebugToast(
        "Evento socket: menu_available",
        payload?.message || "Llegó un evento desde el servidor."
      );
    },
    onError: (message) => {
      showDebugToast("Socket error", message);
    },
  });

  useEffect(() => {
    return () => {
      isMountedRef.current = false;

      if (debugToastTimerRef.current) {
        clearTimeout(debugToastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      if (isLoading) {
        setProfileError(null);
        setIsProfileLoading(false);
        return;
      }

      if (!isAuthenticated || !accessToken || !profileKey) {
        resetProfileState();
        return;
      }

      if (resolvedProfileKeyRef.current === profileKey) {
        setIsProfileLoading(false);
        return;
      }

      if (pendingProfileKeyRef.current === profileKey) {
        setIsProfileLoading(true);
        return;
      }

      try {
        pendingProfileKeyRef.current = profileKey;
        setProfileError(null);
        setIsProfileLoading(true);
        logSessionDebug("Preparando perfil autenticado", {
          endpoint: user?.user_id ? "/users/me; fallback /users/:id si 404" : "/users/me",
          hasAccessToken: Boolean(accessToken),
          hasStoredUser: Boolean(user),
          hasUserId: Boolean(user?.user_id),
        });
        const data = await getProfileBestEffort(accessToken, user?.user_id);

        if (
          isMountedRef.current &&
          currentProfileKeyRef.current === profileKey
        ) {
          resolvedProfileKeyRef.current = profileKey;
          setProfile(data);
          setProfileError(null);
          void saveUserProfile(data).catch((storageError: unknown) => {
            logSessionDebug("No se pudo guardar el perfil local", {
              message: readMessage(storageError),
            });
          });
        }
      } catch (error: unknown) {
        const status = readStatus(error);

        if (
          isExpiredSessionStatus(status) &&
          isMountedRef.current &&
          currentProfileKeyRef.current === profileKey
        ) {
          logSessionDebug("Perfil rechazó la sesión actual", {
            status,
            hasUserId: Boolean(user?.user_id),
          });
          resetProfileState();
          setIsSigningOut(true);

          void logoutLocal()
            .catch(() => undefined)
            .finally(() => {
              if (!isMountedRef.current) {
                return;
              }

              resetProfileState();
              setIsSigningOut(false);
              Alert.alert(
                "Sesión expirada",
                "Tu sesión expiró. Vuelve a iniciar sesión."
              );
            });
          return;
        }

        if (
          isMountedRef.current &&
          currentProfileKeyRef.current === profileKey
        ) {
          const nextError = classifyProfileLoadError(error);
          logSessionDebug("La carga del perfil fallo", {
            status: status ?? -1,
            kind: nextError.kind,
            hasAccessToken: Boolean(accessToken),
            hasStoredUser: Boolean(user),
            hasUserId: Boolean(user?.user_id),
          });

          if (isTransientProfileError(nextError)) {
            try {
              const fallback = await getLocalProfileFallback(user);

              if (
                fallback &&
                isMountedRef.current &&
                currentProfileKeyRef.current === profileKey
              ) {
                resolvedProfileKeyRef.current = profileKey;
                setProfile(fallback.profile);
                setProfileError(null);
                logSessionDebug("Usando perfil local temporal", {
                  source: fallback.source,
                  hasRole: Boolean(fallback.profile.role),
                  hasRestaurantId: Boolean(fallback.profile.restaurantId),
                });
                return;
              }
            } catch (fallbackError: unknown) {
              logSessionDebug("No se pudo leer perfil local temporal", {
                message: readMessage(fallbackError),
              });
            }
          }

          setProfile(null);
          setProfileError(nextError);
        }
      } finally {
        if (pendingProfileKeyRef.current === profileKey) {
          pendingProfileKeyRef.current = null;
        }

        if (
          isMountedRef.current &&
          currentProfileKeyRef.current === profileKey
        ) {
          setIsProfileLoading(false);
        }
      }
    };

    void loadProfile();
  }, [
    accessToken,
    isAuthenticated,
    isLoading,
    logoutLocal,
    profileKey,
    profileRequestKey,
    user?.email,
    user?.user_id,
  ]);

  const shouldCreateRestaurant = useMemo(() => {
    if (!isAuthenticated) {
      return false;
    }

    if (currentProfile?.role !== "admin") {
      return false;
    }

    return !currentProfile?.restaurantId;
  }, [isAuthenticated, currentProfile?.restaurantId, currentProfile?.role]);

  const initialRouteName = useMemo(() => {
    if (!isAuthenticated) {
      return ROUTES.Welcome;
    }

    if (shouldCreateRestaurant) {
      return ROUTES.CreateRestaurant;
    }

    if (currentProfile?.role === "admin") {
      return ROUTES.ManagerProfile;
    }

    return ROUTES.Home;
  }, [currentProfile?.role, isAuthenticated, shouldCreateRestaurant]);

  if (isLoading) {
    return <InitialLoadingScreen message="Cargando sesión…" />;
  }

  if (
    isAuthenticated &&
    profileKey &&
    !currentProfile &&
    (isProfileLoading || (!hasResolvedCurrentProfile && !profileError))
  ) {
    return <InitialLoadingScreen message="Preparando tu perfil..." />;
  }

  if (isAuthenticated && profileKey && !currentProfile && profileError) {
    return (
      <ProfileErrorScreen
        error={profileError}
        isSigningOut={isSigningOut}
        onRetry={retryProfileLoad}
        onLogout={handleLogout}
      />
    );
  }

  const commonStackScreenOptions = {
    contentStyle: { backgroundColor: colors.background },
    headerStyle: { backgroundColor: colors.background },
    headerTintColor: colors.textPrimary,
    headerTitleStyle: {
      color: colors.textPrimary,
      fontWeight: typography.weights.semiBold,
      fontSize: typography.sizes.md,
    },
    headerShadowVisible: false,
  } as const;

  const isStudent = isAuthenticated && currentProfile?.role !== "admin";
  const isAdmin = isAuthenticated && currentProfile?.role === "admin";

  return (
    <>
      {isStudent ? (
        <StudentDrawerNavigator profile={currentProfile} />
      ) : isAdmin && !shouldCreateRestaurant ? (
        <AdminDrawerNavigator profile={currentProfile} />
      ) : (
        <Stack.Navigator
          key={initialRouteName}
          initialRouteName={initialRouteName}
          screenOptions={commonStackScreenOptions}
        >
          <Stack.Screen
            name={ROUTES.Welcome}
            component={WelcomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name={ROUTES.StudentAccess}
            component={StudentAccessScreen}
            options={{ title: "Acceso estudiante" }}
          />
          <Stack.Screen
            name={ROUTES.Login}
            component={LoginScreen}
            options={{ title: "Iniciar sesión" }}
          />
          <Stack.Screen
            name={ROUTES.Register}
            component={RegisterScreen}
            options={{ title: "Registrarse" }}
          />
          <Stack.Screen
            name={ROUTES.CreateRestaurant}
            component={CreateRestaurantScreen}
            options={{
              title: "Crear restaurante",
              headerBackVisible: false,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name={ROUTES.ManagerProfile}
            component={ManagerProfileScreen}
            options={{
              title: "Mi perfil",
              headerBackVisible: false,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name={ROUTES.AddDish}
            component={AddDishScreen}
            options={{
              title: "Añadir plato",
            }}
          />
          <Stack.Screen
            name={ROUTES.RestaurantDetail}
            component={RestaurantDetailScreen}
            options={{ title: "Detalle del restaurante" }}
          />
          <Stack.Screen
            name={ROUTES.MyReservations}
            component={MyReservationsScreen}
            options={{ title: "Mis reservas" }}
          />
          <Stack.Screen
            name={ROUTES.Profile}
            component={ProfileScreen}
            options={{ title: "Perfil" }}
          />
        </Stack.Navigator>
      )}

      {isSocketDebugEnabled ? (
        <DebugToast
          visible={Boolean(debugToast)}
          title={debugToast?.title ?? ""}
          message={debugToast?.message}
          onClose={() => setDebugToast(null)}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    justifyContent: "center",
    paddingBottom: spacing.xxl,
  },
  loadingState: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
  },
  profileErrorCard: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
  },
  profileErrorAction: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    marginTop: spacing.md,
  },
});
