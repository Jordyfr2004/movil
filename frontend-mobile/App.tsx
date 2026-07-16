import "react-native-gesture-handler";
import "react-native-reanimated";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { CartProvider } from "./src/context/CartContext";
import { NetworkProvider, useNetworkStatus } from "./src/context/NetworkContext";
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
import { ErrorBoundary, OfflineBanner } from "./src/components";
import { View, StyleSheet } from "react-native";
import { spacing } from "./src/constants/spacing";

function AppContent() {
  const { navigationTheme } = useAppPreferences();
  const { checkConnection, hasCheckedConnection, isOnline, serverStatus } =
    useNetworkStatus();
  const shouldShowNetworkBanner =
    hasCheckedConnection && (!isOnline || serverStatus === "slow");
  const networkMessage =
    serverStatus === "slow"
      ? "El servidor está tardando en responder."
      : undefined;

  return (
    <NavigationContainer theme={navigationTheme}>
      <ErrorBoundary>
        <View style={styles.appRoot}>
          <AppExperienceGate>
            <AppNavigator />
          </AppExperienceGate>
          <View pointerEvents="box-none" style={styles.offlineBanner}>
            <OfflineBanner
              visible={shouldShowNetworkBanner}
              message={networkMessage}
              onRetry={() => {
                void checkConnection();
              }}
            />
          </View>
        </View>
      </ErrorBoundary>
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
                <NetworkProvider>
                  <FavoritesProvider>
                    <LocalNotificationsProvider>
                      <LocalFeedbackProvider>
                        <AppContent />
                      </LocalFeedbackProvider>
                    </LocalNotificationsProvider>
                  </FavoritesProvider>
                </NetworkProvider>
              </CartProvider>
            </AuthProvider>
          </AppPreferencesProvider>
        </StripeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  appRoot: {
    flex: 1,
  },
  offlineBanner: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
  },
});
