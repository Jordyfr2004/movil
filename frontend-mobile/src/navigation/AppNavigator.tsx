import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ROUTES } from "./routes";
import { RootStackParamList } from "./types";
import { WelcomeScreen } from "../screens/WelcomeScreen";
import { StudentAccessScreen } from "../screens/StudentAccessScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { RestaurantDetailScreen } from "../screens/RestaurantDetailScreen";
import { MenuScreen } from "../screens/MenuScreen";
import { MyReservationsScreen } from "../screens/MyReservationsScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { colors, typography } from "../theme";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          color: colors.textPrimary,
          fontWeight: typography.weights.semiBold,
          fontSize: typography.sizes.md,
        },
        headerBackTitleVisible: false,
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
        name={ROUTES.Home}
        component={HomeScreen}
        options={{ title: "Restaurantes ULEAM" }}
      />
      <Stack.Screen
        name={ROUTES.RestaurantDetail}
        component={RestaurantDetailScreen}
        options={{ title: "Detalle del restaurante" }}
      />
      <Stack.Screen
        name={ROUTES.Menu}
        component={MenuScreen}
        options={{ title: "Menú del día" }}
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
  );
}
