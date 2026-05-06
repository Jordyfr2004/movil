import "react-native-gesture-handler";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { appTheme } from "./src/theme";
import { AuthProvider } from "./src/context/AuthContex";

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer theme={appTheme}>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}