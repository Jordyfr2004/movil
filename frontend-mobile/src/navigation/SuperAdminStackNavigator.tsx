import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useReduceMotion } from "../hooks/useReduceMotion";
import { useThemeColors } from "../hooks/useThemeColors";
import { SuperAdminUserDetailScreen } from "../screens/SuperAdminUserDetailScreen";
import { typography } from "../theme";
import { ROUTES } from "./routes";
import { SuperAdminMainTabs } from "./SuperAdminMainTabs";
import { SuperAdminStackParamList } from "./types";

const Stack =
  createNativeStackNavigator<SuperAdminStackParamList>();

export function SuperAdminStackNavigator() {
  const theme = useThemeColors();
  const reduceMotion = useReduceMotion();

  return (
    <Stack.Navigator
      initialRouteName={
        ROUTES.SuperAdminTabs
      }
      screenOptions={{
        animation: reduceMotion
          ? "none"
          : "slide_from_right",

        animationDuration:
          reduceMotion
            ? 0
            : 180,

        contentStyle: {
          backgroundColor:
            theme.background,
        },

        headerStyle: {
          backgroundColor:
            theme.background,
        },

        headerTintColor:
          theme.textPrimary,

        headerTitleAlign:
          "center",

        headerTitleStyle: {
          color:
            theme.textPrimary,

          fontSize:
            typography.sizes.lg,

          fontWeight:
            typography.weights.bold,
        },

        headerShadowVisible:
          false,
      }}
    >
      <Stack.Screen
        name={
          ROUTES.SuperAdminTabs
        }
        component={
          SuperAdminMainTabs
        }
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name={
          ROUTES.SuperAdminUserDetail
        }
        component={
          SuperAdminUserDetailScreen
        }
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}