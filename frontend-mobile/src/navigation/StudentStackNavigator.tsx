import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { MyReservationsScreen } from "../screens/MyReservationsScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { RestaurantDetailScreen } from "../screens/RestaurantDetailScreen";
import { colors, typography } from "../theme";
import { studentPalette } from "../theme/studentPalette";
import { ROUTES } from "./routes";
import { StudentMainTabs } from "./StudentMainTabs";
import { StudentStackParamList } from "./types";

const Stack = createNativeStackNavigator<StudentStackParamList>();

export function StudentStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: { backgroundColor: studentPalette.background },
        headerStyle: { backgroundColor: studentPalette.background },
        headerTintColor: colors.textPrimary,
        headerTitleAlign: "center",
        headerTitleStyle: {
          color: colors.textPrimary,
          fontWeight: typography.weights.bold,
          fontSize: typography.sizes.lg,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name={ROUTES.Home}
        component={StudentMainTabs}
        options={{ headerShown: false }}
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
  );
}
