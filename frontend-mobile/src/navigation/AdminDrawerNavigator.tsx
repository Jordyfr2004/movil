import React, { useMemo, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { createDrawerNavigator, DrawerContentComponentProps, DrawerContentScrollView } from "@react-navigation/drawer";
import { DrawerActions } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import { StudentVisualPlaceholder } from "../components/StudentVisualPlaceholder";
import { spacing } from "../constants/spacing";
import { useAuth } from "../context/AuthContext";
import { UserProfile } from "../services/userService";
import { colors, typography } from "../theme";
import { studentPalette } from "../theme/studentPalette";
import { ROUTES } from "./routes";
import { AdminStackNavigator } from "./AdminStackNavigator";
import { AdminDrawerParamList } from "./types";

const DRAWER_BACKGROUND_IMAGE = require("../assets/images/menu_drawer_uleam_transparente.png");

const Drawer = createDrawerNavigator<AdminDrawerParamList>();

type AdminDrawerContentProps = DrawerContentComponentProps & {
	profile: UserProfile | null;
};

function AdminDrawerContent({ profile, ...props }: AdminDrawerContentProps) {
	const { user, logout } = useAuth();
	const { navigation } = props;
	const insets = useSafeAreaInsets();
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const displayName = useMemo(() => {
		const name = profile?.fullName?.trim();
		if (name) return name;

		const email = user?.email?.trim();
		if (!email) return "Administrador";
		return email.split("@")[0] || "Administrador";
	}, [profile?.fullName, user?.email]);

	const displayEmail = useMemo(() => {
		return profile?.email?.trim() || user?.email || "";
	}, [profile?.email, user?.email]);

	const initial = useMemo(() => {
		const source = displayName || user?.email || "A";
		return source.trim().charAt(0).toUpperCase() || "A";
	}, [displayName, user?.email]);

	const handleGoToProfile = () => {
		navigation.dispatch(DrawerActions.closeDrawer());
		navigation.navigate("AdminStack", {
			screen: ROUTES.ManagerProfile,
		});
	};

	const handleGoToAddDish = () => {
		if (!profile?.restaurantId) {
			navigation.dispatch(DrawerActions.closeDrawer());
			Alert.alert(
				"Restaurante no asignado",
				"Primero debes tener un restaurante creado y asignado para poder añadir platos."
			);
			return;
		}

		navigation.dispatch(DrawerActions.closeDrawer());
		navigation.navigate("AdminStack", {
			screen: ROUTES.AddDish,
		});
	};

	const handleLogout = async () => {
		if (isLoggingOut) return;

		try {
			setIsLoggingOut(true);
			navigation.dispatch(DrawerActions.closeDrawer());
			await logout();
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "No se pudo cerrar sesión";
			Alert.alert("Error", message);
		} finally {
			setIsLoggingOut(false);
		}
	};

	return (
		<DrawerContentScrollView
			{...props}
			contentContainerStyle={[
				styles.contentContainer,
				{
					paddingTop: Math.max(insets.top + spacing.lg, spacing.xxl),
					paddingBottom: Math.max(insets.bottom + spacing.lg, spacing.xxl),
				},
			]}
		>
			<View
				style={styles.drawerDecor}
				pointerEvents="none"
				accessible={false}
				accessibilityElementsHidden
				importantForAccessibility="no-hide-descendants"
			>
				<Svg width="100%" height={150} viewBox="0 0 320 150" preserveAspectRatio="none" style={styles.drawerWave}>
					<Path d="M0 0 H320 V80 C252 104 199 52 132 76 C78 98 39 94 0 78 Z" fill={studentPalette.backgroundStrong} />
				</Svg>
				<View style={styles.decorCircle} />
			</View>

			<View style={styles.drawerBrand}>
				<View style={styles.drawerBrandIcon}>
					<MaterialCommunityIcons name="store-cog-outline" size={22} color={studentPalette.primary} />
				</View>
				<Text style={styles.drawerBrandTitle}>
					Menú <Text style={styles.drawerBrandAccent}>administrador</Text>
				</Text>
			</View>

			<Pressable
				accessibilityRole="button"
				accessibilityLabel="Ir al perfil del administrador"
				onPress={handleGoToProfile}
				style={({ pressed }) => [styles.userCard, pressed && styles.cardPressed]}
			>
				<StudentVisualPlaceholder
					initial={initial}
					label={`Perfil de administrador ${displayName}`}
					size="sm"
					style={styles.avatar}
					variant="profile"
				/>

				<View style={styles.userText}>
					<Text style={styles.userName} numberOfLines={1}>
						{displayName}
					</Text>
					{!!displayEmail && (
						<Text style={styles.userEmail} numberOfLines={1}>
							{displayEmail}
						</Text>
					)}
					<View style={styles.rolePill}>
						<MaterialCommunityIcons name="shield-account-outline" size={12} color={studentPalette.primary} />
						<Text style={styles.rolePillText}>Administrador</Text>
					</View>
				</View>

				<MaterialCommunityIcons name="chevron-right" size={21} color={studentPalette.textMuted} />
			</Pressable>

			<View style={styles.menuCard}>
				<DrawerMenuItem iconName="home" label="Inicio" onPress={handleGoToProfile} />
				<View style={styles.itemDivider} />
				<DrawerMenuItem iconName="plus-box-outline" label="Añadir platos" onPress={handleGoToAddDish} />
			</View>

			<View style={styles.grow} />

			<View style={styles.footerDecor} pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
				<Image source={DRAWER_BACKGROUND_IMAGE} resizeMode="contain" style={styles.footerDecorImage} />
			</View>

			<Pressable
				accessibilityRole="button"
				accessibilityLabel="Cerrar sesión"
				onPress={handleLogout}
				disabled={isLoggingOut}
				style={({ pressed }) => [
					styles.logoutItem,
					pressed && styles.cardPressed,
					isLoggingOut && styles.itemDisabled,
				]}
			>
				<View style={styles.logoutIcon}>
					<MaterialCommunityIcons name="logout-variant" size={20} color={studentPalette.primary} />
				</View>
				<Text style={styles.logoutText}>{isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}</Text>
				<MaterialCommunityIcons name="chevron-right" size={21} color={studentPalette.textMuted} />
			</Pressable>
		</DrawerContentScrollView>
	);
}

function DrawerMenuItem({ iconName, label, onPress }: { iconName: React.ComponentProps<typeof MaterialCommunityIcons>["name"]; label: string; onPress: () => void; }) {
	return (
		<Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.drawerItem, pressed && styles.drawerItemPressed]}>
			<View style={styles.drawerItemIcon}>
				<MaterialCommunityIcons name={iconName} size={20} color={studentPalette.primary} />
			</View>
			<Text style={styles.drawerItemText}>{label}</Text>
			<MaterialCommunityIcons name="chevron-right" size={21} color={studentPalette.textMuted} />
		</Pressable>
	);
}

export function AdminDrawerNavigator({ profile }: { profile: UserProfile | null }) {
	const { width } = useWindowDimensions();
	const drawerWidth = Math.max(276, Math.min(320, Math.round(width * 0.82)));

	return (
		<Drawer.Navigator
			screenOptions={{
				headerShown: false,
				drawerType: "front",
				swipeEdgeWidth: 32,
				overlayColor: colors.shadow,
				drawerStyle: {
					width: drawerWidth,
					backgroundColor: studentPalette.background,
				},
			}}
			drawerContent={(props) => <AdminDrawerContent {...props} profile={profile} />}
		>
			<Drawer.Screen name="AdminStack" component={AdminStackNavigator} />
		</Drawer.Navigator>
	);
}

const styles = StyleSheet.create({
	contentContainer: {
		paddingHorizontal: spacing.lg,
		flexGrow: 1,
		backgroundColor: studentPalette.background,
	},
	drawerDecor: {
		position: "absolute",
		top: 0,
		right: 0,
		left: 0,
		height: 150,
		overflow: "hidden",
	},
	drawerWave: {
		position: "absolute",
		top: 0,
		right: 0,
		left: 0,
	},
	decorCircle: {
		position: "absolute",
		width: 120,
		height: 120,
		borderRadius: 999,
		right: -40,
		top: -26,
		backgroundColor: "rgba(247, 101, 2, 0.08)",
	},
	drawerBrand: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.sm,
		marginBottom: spacing.lg,
	},
	drawerBrandIcon: {
		width: 40,
		height: 40,
		borderRadius: 14,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: studentPalette.card,
		borderWidth: 1,
		borderColor: studentPalette.border,
		shadowColor: studentPalette.shadow,
		shadowOpacity: 1,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 4 },
		elevation: 1,
	},
	drawerBrandTitle: {
		flex: 1,
		fontSize: typography.sizes.lg,
		color: studentPalette.textPrimary,
		fontWeight: typography.weights.bold,
		lineHeight: typography.lineHeights.lg,
	},
	drawerBrandAccent: {
		color: studentPalette.primary,
	},
	userCard: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.sm,
		padding: spacing.sm,
		borderRadius: 20,
		backgroundColor: studentPalette.card,
		borderWidth: 1,
		borderColor: studentPalette.border,
		shadowColor: studentPalette.shadow,
		shadowOpacity: 1,
		shadowRadius: 10,
		shadowOffset: { width: 0, height: 5 },
		elevation: 2,
	},
	cardPressed: {
		backgroundColor: studentPalette.primaryFaint,
	},
	avatar: {
		width: 54,
		height: 54,
		borderRadius: 999,
	},
	userText: {
		flex: 1,
		minWidth: 0,
		gap: 2,
	},
	userName: {
		fontSize: typography.sizes.md,
		fontWeight: typography.weights.bold,
		color: studentPalette.textPrimary,
		lineHeight: typography.lineHeights.md,
	},
	userEmail: {
		fontSize: typography.sizes.sm,
		color: studentPalette.textSecondary,
		lineHeight: typography.lineHeights.sm,
	},
	rolePill: {
		alignSelf: "flex-start",
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		marginTop: 4,
		paddingVertical: 4,
		paddingHorizontal: spacing.sm,
		borderRadius: 999,
		backgroundColor: studentPalette.primaryPale,
		borderWidth: 1,
		borderColor: studentPalette.primarySoft,
	},
	rolePillText: {
		fontSize: typography.sizes.xs,
		color: studentPalette.primary,
		fontWeight: typography.weights.semiBold,
	},
	menuCard: {
		marginTop: spacing.lg,
		borderRadius: 20,
		backgroundColor: studentPalette.card,
		borderWidth: 1,
		borderColor: studentPalette.border,
		shadowColor: studentPalette.shadow,
		shadowOpacity: 1,
		shadowRadius: 10,
		shadowOffset: { width: 0, height: 5 },
		elevation: 2,
		overflow: "hidden",
	},
	drawerItem: {
		minHeight: 56,
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.md,
		paddingVertical: spacing.sm,
		paddingHorizontal: spacing.md,
	},
	drawerItemPressed: {
		backgroundColor: studentPalette.primaryFaint,
	},
	drawerItemIcon: {
		width: 34,
		height: 34,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: studentPalette.primaryPale,
	},
	drawerItemText: {
		flex: 1,
		fontSize: typography.sizes.md,
		color: studentPalette.textPrimary,
		fontWeight: typography.weights.semiBold,
		lineHeight: typography.lineHeights.md,
	},
	itemDivider: {
		height: 1,
		marginLeft: 58,
		backgroundColor: studentPalette.border,
	},
	grow: {
		flex: 1,
		minHeight: spacing.xl,
	},
	footerDecor: {
		height: 315,
		marginTop: spacing.lg,
		marginBottom: spacing.md,
		justifyContent: "flex-end",
		alignItems: "center",
		overflow: "visible",
		opacity: 0.78,
	},
	footerDecorImage: {
		width: 430,
		height: 330,
	},
	logoutItem: {
		minHeight: 56,
		flexDirection: "row",
		alignItems: "center",
		gap: spacing.md,
		paddingVertical: spacing.sm,
		paddingHorizontal: spacing.md,
		borderRadius: 18,
		backgroundColor: studentPalette.card,
		borderWidth: 1,
		borderColor: studentPalette.border,
		shadowColor: studentPalette.shadow,
		shadowOpacity: 1,
		shadowRadius: 10,
		shadowOffset: { width: 0, height: 5 },
		elevation: 2,
		marginBottom: spacing.md,
	},
	logoutIcon: {
		width: 34,
		height: 34,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: studentPalette.primaryPale,
	},
	logoutText: {
		flex: 1,
		fontSize: typography.sizes.md,
		color: studentPalette.primary,
		fontWeight: typography.weights.semiBold,
		lineHeight: typography.lineHeights.md,
	},
	itemDisabled: {
		opacity: 0.7,
	},
});
