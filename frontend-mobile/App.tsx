import "react-native-gesture-handler";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { appTheme } from "./src/theme";

export default function App() {
  return (
    <NavigationContainer theme={appTheme}>
      <AppNavigator />
    </NavigationContainer>
  );
}