import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { AddDishScreen } from "../screens/AddDishScreen";
import { ManagerQrScannerScreen } from "../screens/ManagerQrScannerScreen";
import { ManagerProfileScreen } from "../screens/ManagerProfileScreen";
import { colors, typography } from "../theme";
import { managerPalette } from "../components/managerProfile/managerProfileTheme";
import { ROUTES } from "./routes";
import { AdminDrawerParamList, AdminStackParamList } from "./types";

const Stack = createNativeStackNavigator<AdminStackParamList>();

export function AdminStackNavigator() {
	return (
		<Stack.Navigator
			screenOptions={{
				contentStyle: { backgroundColor: managerPalette.background },
				headerStyle: { backgroundColor: managerPalette.background },
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
				name={ROUTES.ManagerProfile}
				component={ManagerProfileScreen}
				options={({ navigation }) => ({
					title: "Panel Administrador",
					headerLeft: () => (
						<Pressable
							accessibilityRole="button"
							accessibilityLabel="Abrir menú"
							onPress={() => {
								const parent =
									navigation.getParent<DrawerNavigationProp<AdminDrawerParamList>>();
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
								color={managerPalette.primary}
							/>
						</Pressable>
					),
				})}
			/>

			<Stack.Screen
				name={ROUTES.AddDish}
				component={AddDishScreen}
				options={({ navigation }) => ({
					title: "Añadir plato",
					headerLeft: () => (
						<Pressable
							accessibilityRole="button"
							accessibilityLabel="Abrir menú"
							onPress={() => {
								const parent =
									navigation.getParent<DrawerNavigationProp<AdminDrawerParamList>>();
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
								color={managerPalette.primary}
							/>
						</Pressable>
					),
				})}
			/>

			<Stack.Screen
				name={ROUTES.ManagerQrScanner}
				component={ManagerQrScannerScreen}
				options={{ title: "Escanear QR" }}
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
