import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { RootStackParamList } from "./types";
import { ROUTES } from "./routes";

import { HomeScreen } from "../screens/HomeScreen";
import { EvidenceScreen } from "../screens/EvidenceScreen";
import { RestaurantDetailScreen } from "../screens/RestaurantDetailScreen";
import { MyReservationsScreen } from "../screens/MyReservationsScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { SensorMovimientoScreen } from "../screens/SensorMovimientoScreen";

import { colors, typography } from "../theme";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function StudentStackNavigator() {
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
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name={ROUTES.Home}
        component={HomeScreen}
        options={({ navigation }) => ({
          title: "Restaurantes ULEAM",
          headerLeft: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Abrir menú"
              onPress={() => {
                const parent = navigation.getParent();
                // Drawer navigator vive arriba del stack.
                (parent as any)?.openDrawer?.();
              }}
              hitSlop={10}
              style={({ pressed }) => [
                styles.menuButton,
                pressed && styles.menuButtonPressed,
              ]}
            >
              <MaterialCommunityIcons
                name="menu"
                size={22}
                color={colors.textPrimary}
              />
            </Pressable>
          ),
        })}
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
        name={ROUTES.Evidence}
        component={EvidenceScreen}
        options={{ title: "Evidencias" }}
      />
      <Stack.Screen
        name={ROUTES.SensorMovimiento}
        component={SensorMovimientoScreen}
        options={{ title: "Acelerómetro" }}
      />
      <Stack.Screen
        name={ROUTES.Profile}
        component={ProfileScreen}
        options={{ title: "Perfil" }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  menuButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
