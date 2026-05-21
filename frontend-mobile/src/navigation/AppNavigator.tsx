import React, { useEffect, useMemo, useRef, useState } from "react";
import { ENABLE_WS_DEBUG } from "../constants/api";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ROUTES } from "./routes";
import { RootStackParamList } from "./types";
import { WelcomeScreen } from "../screens/WelcomeScreen";
import { StudentAccessScreen } from "../screens/StudentAccessScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { CreateRestaurantScreen } from "../screens/CreateRestaurantScreen";
import { ManagerProfileScreen } from "../screens/ManagerProfileScreen";
import { AddDishScreen } from "../screens/AddDishScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { EvidenceScreen } from "../screens/EvidenceScreen";
import { RestaurantDetailScreen } from "../screens/RestaurantDetailScreen";
import { MyReservationsScreen } from "../screens/MyReservationsScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { SensorMovimientoScreen } from "../screens/SensorMovimientoScreen";
import { colors, typography } from "../theme";
import { useAuth } from "../context/AuthContex";
import { getProfileBestEffort, UserProfile } from "../services/userService";
import { useSocketDebug } from "../hooks/useSocketDebug";
import { DebugToast } from "../components/DebugToast";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { isAuthenticated, isLoading, accessToken, user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const [debugToast, setDebugToast] = useState<
    { title: string; message?: string } | null
  >(null);
  const debugToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showDebugToast = (title: string, message?: string) => {
    if (!ENABLE_WS_DEBUG) return;

    setDebugToast({ title, message });

    if (debugToastTimerRef.current) {
      clearTimeout(debugToastTimerRef.current);
    }

    // “Unos minutos” para observar pruebas sin molestar demasiado.
    debugToastTimerRef.current = setTimeout(() => {
      setDebugToast(null);
      debugToastTimerRef.current = null;
    }, 120_000);
  };

  // Solo en DEV: prueba rápida de Socket.IO (sin alertas intrusivas).
  useSocketDebug(accessToken, {
    onMenuAvailable: (payload) => {
      showDebugToast(
        "Evento socket: menu_available",
        payload?.message || "Llegó un evento desde el servidor."
      );
    },
    onError: (message) => {
      // Si quieres cero UI también para errores, comenta esta línea.
      showDebugToast("Socket error", message);
    },
  });

  useEffect(() => {
    return () => {
      if (debugToastTimerRef.current) {
        clearTimeout(debugToastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadProfile = async () => {
      if (isLoading) {
        setProfile(null);
        setIsProfileLoading(false);
        return;
      }

      if (!isAuthenticated || !accessToken) {
        setProfile(null);
        setIsProfileLoading(false);
        return;
      }

      try {
        setIsProfileLoading(true);
        const data = await getProfileBestEffort(accessToken, user?.user_id);
        if (isActive) setProfile(data);
      } catch {
        if (isActive) setProfile(null);
      } finally {
        if (isActive) setIsProfileLoading(false);
      }
    };

    loadProfile();

    return () => {
      isActive = false;
    };
  }, [isLoading, isAuthenticated, accessToken, user?.user_id]);

  const shouldCreateRestaurant = useMemo(() => {
    if (!isAuthenticated) return false;
    if (profile?.role !== "admin") return false;
    return !profile?.restaurantId;
  }, [isAuthenticated, profile?.role, profile?.restaurantId]);

  const initialRouteName = useMemo(() => {
    if (!isAuthenticated) return ROUTES.Welcome;
    if (shouldCreateRestaurant) return ROUTES.CreateRestaurant;
    if (profile?.role === "admin") return ROUTES.ManagerProfile;
    return ROUTES.Home;
  }, [isAuthenticated, shouldCreateRestaurant, profile?.role]);

  if (isLoading) {
    return null;
  }

  if (isAuthenticated && isProfileLoading) {
    return null;
  }

  return (
    <>
      <Stack.Navigator
        key={initialRouteName}
        initialRouteName={initialRouteName}
        screenOptions={{
          contentStyle: { backgroundColor: colors.background },
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: {
            color: colors.textPrimary,
            fontWeight: typography.weights.semiBold,
            fontSize: typography.sizes.md,
          },
          headerShadowVisible: false,
        }}
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
        name={ROUTES.Home}
        component={HomeScreen}
        options={{ title: "Restaurantes ULEAM" }}
      />
      <Stack.Screen
        name={ROUTES.Evidence}
        component={EvidenceScreen}
        options={{ title: "Evidencias" }}
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
      <Stack.Screen
        name={ROUTES.SensorMovimiento}
        component={SensorMovimientoScreen}
        options={{ title: "Acelerómetro" }}
      />
      </Stack.Navigator>

      <DebugToast
        visible={Boolean(debugToast)}
        title={debugToast?.title ?? ""}
        message={debugToast?.message}
        onClose={() => setDebugToast(null)}
      />
    </>
  );
}
