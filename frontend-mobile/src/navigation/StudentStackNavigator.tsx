import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { CartScreen } from "../screens/CartScreen";
import { CheckoutScreen } from "../screens/CheckoutScreen";
import { AppearanceScreen } from "../screens/AppearanceScreen";
import { FoodDetailScreen } from "../screens/FoodDetailScreen";
import { HelpScreen } from "../screens/HelpScreen";
import { HelpDetailScreen } from "../screens/HelpDetailScreen";
import { LocalPendingScreen } from "../screens/LocalPendingScreen";
import { MyReservationsScreen } from "../screens/MyReservationsScreen";
import { NotificationsScreen } from "../screens/NotificationsScreen";
import { OnboardingReviewScreen } from "../screens/OnboardingReviewScreen";
import { OnboardingFullScreen } from "../screens/OnboardingFullScreen";
import { OnboardingStageDetailScreen } from "../screens/OnboardingStageDetailScreen";
import { PendingDetailScreen } from "../screens/PendingDetailScreen";
import { ProblemReportScreen } from "../screens/ProblemReportScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { RatingScreen } from "../screens/RatingScreen";
import { ReservationTrackingScreen } from "../screens/ReservationTrackingScreen";
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
        name={ROUTES.FoodDetail}
        component={FoodDetailScreen}
        options={{ title: "Detalle del plato" }}
      />

      <Stack.Screen
        name={ROUTES.Cart}
        component={CartScreen}
        options={{ title: "Carrito" }}
      />

      <Stack.Screen
        name={ROUTES.Checkout}
        component={CheckoutScreen}
        options={{ title: "Checkout" }}
      />

      <Stack.Screen
        name={ROUTES.ReservationTracking}
        component={ReservationTrackingScreen}
        options={{ title: "Seguimiento" }}
      />

      <Stack.Screen
        name={ROUTES.Notifications}
        component={NotificationsScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name={ROUTES.Appearance}
        component={AppearanceScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name={ROUTES.Rating}
        component={RatingScreen}
        options={{ title: "Calificación" }}
      />

      <Stack.Screen
        name={ROUTES.ProblemReport}
        component={ProblemReportScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name={ROUTES.Help}
        component={HelpScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name={ROUTES.LocalPending}
        component={LocalPendingScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name={ROUTES.OnboardingReview}
        component={OnboardingReviewScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name={ROUTES.OnboardingStageDetail}
        component={OnboardingStageDetailScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name={ROUTES.OnboardingFull}
        component={OnboardingFullScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name={ROUTES.HelpDetail}
        component={HelpDetailScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name={ROUTES.PendingDetail}
        component={PendingDetailScreen}
        options={{ headerShown: false }}
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
