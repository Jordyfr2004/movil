import React, { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import { DrawerActions } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";

import {
  DecorBowlIcon,
  DecorCupIcon,
  DecorLeafIcon,
} from "../components/login/LoginDecorIcons";
import { spacing } from "../constants/spacing";
import { useAuth } from "../context/AuthContext";
import { UserProfile } from "../services/userService";
import { colors, typography } from "../theme";
import { studentPalette } from "../theme/studentPalette";
import { ROUTES } from "./routes";
import { StudentStackNavigator } from "./StudentStackNavigator";
import { StudentDrawerParamList } from "./types";

const Drawer = createDrawerNavigator<StudentDrawerParamList>();

type StudentDrawerContentProps = DrawerContentComponentProps & {
  profile: UserProfile | null;
};

type StudentDrawerTargetRoute =
  | typeof ROUTES.Profile
  | typeof ROUTES.MyReservations;

function StudentDrawerContent({
  profile,
  ...props
}: StudentDrawerContentProps) {
  const { user, logout } = useAuth();
  const { navigation } = props;
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const displayName = useMemo(() => {
    const name = profile?.fullName?.trim();
    if (name) return name;

    const email = user?.email?.trim();
    if (!email) return "Usuario";
    return email.split("@")[0] || "Usuario";
  }, [profile?.fullName, user?.email]);

  const initial = useMemo(() => {
    const source = displayName || user?.email || "U";
    return source.trim().charAt(0).toUpperCase() || "U";
  }, [displayName, user?.email]);

  const handleGoTo = (routeName: StudentDrawerTargetRoute) => {
    navigation.dispatch(DrawerActions.closeDrawer());
    navigation.navigate("StudentStack", {
      screen: routeName,
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
      contentContainerStyle={styles.contentContainer}
    >
      <View
        style={styles.drawerDecor}
        pointerEvents="none"
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Svg
          width="100%"
          height={154}
          viewBox="0 0 320 154"
          preserveAspectRatio="none"
          style={styles.drawerWave}
        >
          <Path
            d="M0 0 H320 V84 C252 122 199 56 132 88 C78 114 39 110 0 91 Z"
            fill={studentPalette.backgroundStrong}
          />
        </Svg>
        <View style={styles.drawerCup}>
          <DecorCupIcon color={studentPalette.decorOrangeSoft} size={42} />
        </View>
        <View style={styles.drawerLeaf}>
          <DecorLeafIcon color={studentPalette.decorOrangeSoft} size={38} />
        </View>
      </View>

      <View style={styles.drawerBrand}>
        <View style={styles.drawerBrandIcon}>
          <MaterialCommunityIcons
            name="silverware-fork-knife"
            size={18}
            color={studentPalette.card}
          />
        </View>
        <View style={styles.drawerBrandText}>
          <Text style={styles.drawerBrandTitle}>Menú estudiantil</Text>
          <Text style={styles.drawerBrandSubtitle}>Tu espacio de reservas</Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ir al perfil"
        onPress={() => handleGoTo(ROUTES.Profile)}
        style={({ pressed }) => [
          styles.userRow,
          pressed && styles.userRowPressed,
        ]}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>

        <View style={styles.userText}>
          <Text style={styles.profileLabel}>PERFIL</Text>
          <Text style={styles.userName} numberOfLines={1}>
            {displayName}
          </Text>
          {!!user?.email && (
            <Text style={styles.userEmail} numberOfLines={1}>
              {user.email}
            </Text>
          )}
        </View>
      </Pressable>

      <View style={styles.divider} />

      <Text style={styles.sectionLabel}>TU CUENTA</Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ir a Mis reservas"
        onPress={() => handleGoTo(ROUTES.MyReservations)}
        style={({ pressed }) => [
          styles.drawerItem,
          pressed && styles.drawerItemPressed,
        ]}
      >
        <View style={styles.drawerItemIcon}>
          <MaterialCommunityIcons
            name="calendar-check-outline"
            size={20}
            color={studentPalette.primary}
          />
        </View>
        <Text style={styles.drawerItemText}>Mis reservas</Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={studentPalette.primary}
        />
      </Pressable>

      <View style={styles.grow} />

      <View
        style={styles.drawerFooterArt}
        pointerEvents="none"
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <DecorBowlIcon color={studentPalette.decorOrange} size={52} />
        <DecorLeafIcon color={studentPalette.decorOrangeSoft} size={42} />
      </View>

      <View style={styles.divider} />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cerrar sesión"
        onPress={handleLogout}
        disabled={isLoggingOut}
        style={({ pressed }) => [
          styles.drawerItem,
          pressed && styles.drawerItemPressed,
          isLoggingOut && styles.drawerItemDisabled,
        ]}
      >
        <View style={styles.drawerItemIconDanger}>
          <MaterialCommunityIcons
            name="logout-variant"
            size={20}
            color={studentPalette.danger}
          />
        </View>
        <Text style={styles.drawerItemTextDanger}>
          {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
        </Text>
      </Pressable>
    </DrawerContentScrollView>
  );
}

export function StudentDrawerNavigator({
  profile,
}: {
  profile: UserProfile | null;
}) {
  const { width } = useWindowDimensions();
  const drawerWidth = Math.max(260, Math.min(300, Math.round(width * 0.78)));

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
      drawerContent={(props) => (
        <StudentDrawerContent {...props} profile={profile} />
      )}
    >
      <Drawer.Screen name="StudentStack" component={StudentStackNavigator} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    flexGrow: 1,
    backgroundColor: studentPalette.background,
  },
  drawerDecor: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    height: 154,
    overflow: "hidden",
  },
  drawerWave: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
  },
  drawerCup: {
    position: "absolute",
    top: 10,
    right: 14,
    transform: [{ rotate: "8deg" }],
  },
  drawerLeaf: {
    position: "absolute",
    top: 68,
    right: 54,
    transform: [{ rotate: "-10deg" }],
  },
  drawerBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xs,
  },
  drawerBrandText: {
    flex: 1,
    minWidth: 0,
  },
  drawerBrandIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: studentPalette.primary,
    shadowColor: studentPalette.primary,
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  drawerBrandTitle: {
    fontSize: typography.sizes.md,
    color: studentPalette.textPrimary,
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.md,
  },
  drawerBrandSubtitle: {
    fontSize: typography.sizes.xs,
    color: studentPalette.textSecondary,
    lineHeight: typography.lineHeights.xs,
  },
  grow: {
    flex: 1,
  },
  drawerFooterArt: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    opacity: 0.9,
  },
  divider: {
    height: 1,
    backgroundColor: studentPalette.border,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 20,
    backgroundColor: studentPalette.card,
    borderWidth: 1,
    borderColor: studentPalette.border,
    shadowColor: studentPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  userRowPressed: {
    backgroundColor: studentPalette.primaryPale,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: studentPalette.primaryPale,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: studentPalette.border,
  },
  avatarText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: studentPalette.primary,
  },
  userText: {
    flex: 1,
    gap: 2,
  },
  profileLabel: {
    fontSize: 10,
    color: studentPalette.primary,
    fontWeight: typography.weights.bold,
    letterSpacing: 1,
    lineHeight: 14,
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
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 56,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
    backgroundColor: studentPalette.card,
    borderWidth: 1,
    borderColor: studentPalette.border,
    shadowColor: studentPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  drawerItemPressed: {
    backgroundColor: studentPalette.primaryPale,
  },
  drawerItemDisabled: {
    opacity: 0.7,
  },
  drawerItemText: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: studentPalette.textPrimary,
    fontWeight: typography.weights.semiBold,
    lineHeight: typography.lineHeights.md,
  },
  drawerItemTextDanger: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: studentPalette.danger,
    fontWeight: typography.weights.semiBold,
    lineHeight: typography.lineHeights.md,
  },
  sectionLabel: {
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.sm,
    fontSize: 10,
    color: studentPalette.textSecondary,
    fontWeight: typography.weights.bold,
    letterSpacing: 1.1,
    lineHeight: 14,
  },
  drawerItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: studentPalette.primaryPale,
  },
  drawerItemIconDanger: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: studentPalette.dangerSoft,
  },
});
