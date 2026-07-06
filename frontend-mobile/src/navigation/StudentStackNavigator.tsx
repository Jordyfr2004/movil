import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { HomeScreen } from "../screens/HomeScreen";
import { MyReservationsScreen } from "../screens/MyReservationsScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { RestaurantDetailScreen } from "../screens/RestaurantDetailScreen";
import { colors, typography } from "../theme";
import { studentPalette } from "../theme/studentPalette";
import { ROUTES } from "./routes";
import { StudentDrawerParamList, StudentStackParamList } from "./types";

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
        component={HomeScreen}
        options={({ navigation }) => ({
          title: "Explorar restaurantes",
          headerLeft: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Abrir menú"
              onPress={() => {
                const parent =
                  navigation.getParent<
                    DrawerNavigationProp<StudentDrawerParamList>
                  >();
                parent?.openDrawer();
              }}
              hitSlop={10}
              style={({ pressed }) => [
                styles.menuButton,
                pressed && styles.menuButtonPressed,
              ]}
            >
              <MaterialCommunityIcons
                name="menu"
                size={25}
                color={studentPalette.primary}
              />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Notificaciones"
              hitSlop={10}
              style={({ pressed }) => [
                styles.menuButton,
                pressed && styles.menuButtonPressed,
              ]}
            >
              <MaterialCommunityIcons
                name="bell-outline"
                size={23}
                color={studentPalette.primary}
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
        name={ROUTES.Profile}
        component={ProfileScreen}
        options={{ title: "Perfil" }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  menuButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
});