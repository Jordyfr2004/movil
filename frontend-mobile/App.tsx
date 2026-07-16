import "react-native-gesture-handler";
import "react-native-reanimated";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { CartProvider } from "./src/context/CartContext";
import {
  AppPreferencesProvider,
  useAppPreferences,
} from "./src/context/AppPreferencesContext";
import { FavoritesProvider } from "./src/context/FavoritesContext";
import { LocalFeedbackProvider } from "./src/context/LocalFeedbackContext";
import { LocalNotificationsProvider } from "./src/context/LocalNotificationsContext";
import { StripeProvider } from "@stripe/stripe-react-native";
import { STRIPE_PUBLISHABLE_KEY } from "./src/constants/stripe";
import { AppExperienceGate } from "./src/screens/AppExperienceGate";

function AppContent() {
  const { navigationTheme } = useAppPreferences();

  return (
    <NavigationContainer theme={navigationTheme}>
      <AppExperienceGate>
        <AppNavigator />
      </AppExperienceGate>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
          <AppPreferencesProvider>
            <AuthProvider>
              <CartProvider>
                <FavoritesProvider>
                  <LocalNotificationsProvider>
                    <LocalFeedbackProvider>
                      <AppContent />
                    </LocalFeedbackProvider>
                  </LocalNotificationsProvider>
                </FavoritesProvider>
              </CartProvider>
            </AuthProvider>
          </AppPreferencesProvider>
        </StripeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
