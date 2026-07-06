import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import { StudentVisualPlaceholder } from "../components/StudentVisualPlaceholder";
import { spacing } from "../constants/spacing";
import { useAuth } from "../context/AuthContext";
import { UserProfile } from "../services/userService";
import { colors, typography } from "../theme";
import { studentPalette } from "../theme/studentPalette";
import { ROUTES } from "./routes";
import { StudentStackNavigator } from "./StudentStackNavigator";
import { StudentDrawerParamList } from "./types";

const DRAWER_BACKGROUND_IMAGE = require("../assets/images/menu_drawer_uleam_transparente.png");

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
  const insets = useSafeAreaInsets();
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
        <Svg
          width="100%"
          height={150}
          viewBox="0 0 320 150"
          preserveAspectRatio="none"
          style={styles.drawerWave}
        >
          <Path
            d="M0 0 H320 V80 C252 104 199 52 132 76 C78 98 39 94 0 78 Z"
            fill={studentPalette.backgroundStrong}
          />
        </Svg>
        <View style={styles.decorCircle} />
      </View>

      <View style={styles.drawerBrand}>
        <View style={styles.drawerBrandIcon}>
          <MaterialCommunityIcons
            name="school-outline"
            size={22}
            color={studentPalette.primary}
          />
        </View>
        <Text style={styles.drawerBrandTitle}>
          Menú <Text style={styles.drawerBrandAccent}>estudiantil</Text>
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ir al perfil"
        onPress={() => handleGoTo(ROUTES.Profile)}
        style={({ pressed }) => [
          styles.userCard,
          pressed && styles.cardPressed,
        ]}
      >
        <StudentVisualPlaceholder
          initial={initial}
          label={`Perfil de ${displayName}`}
          size="sm"
          style={styles.avatar}
          variant="profile"
        />

        <View style={styles.userText}>
          <Text style={styles.userName} numberOfLines={1}>
            {displayName}
          </Text>
          {!!user?.email && (
            <Text style={styles.userEmail} numberOfLines={1}>
              {user.email}
            </Text>
          )}
        </View>

        <MaterialCommunityIcons
          name="chevron-right"
          size={21}
          color={studentPalette.textMuted}
        />
      </Pressable>

      <View style={styles.menuCard}>
        <DrawerMenuItem
          iconName="home"
          label="Inicio"
          onPress={() => navigation.dispatch(DrawerActions.closeDrawer())}
        />
        <View style={styles.itemDivider} />

        <DrawerMenuItem
          iconName="calendar-check-outline"
          label="Mis reservas"
          onPress={() => handleGoTo(ROUTES.MyReservations)}
        />
        <View style={styles.itemDivider} />

        <DrawerMenuItem
          iconName="account-outline"
          label="Mi perfil"
          onPress={() => handleGoTo(ROUTES.Profile)}
        />
      </View>

      <View style={styles.grow} />

      <View
        style={styles.footerDecor}
        pointerEvents="none"
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Image
          source={DRAWER_BACKGROUND_IMAGE}
          resizeMode="contain"
          style={styles.footerDecorImage}
        />
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
          <MaterialCommunityIcons
            name="logout-variant"
            size={20}
            color={studentPalette.primary}
          />
        </View>
        <Text style={styles.logoutText}>
          {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
        </Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={21}
          color={studentPalette.textMuted}
        />
      </Pressable>
    </DrawerContentScrollView>
  );
}

function DrawerMenuItem({
  iconName,
  label,
  onPress,
}: {
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.drawerItem,
        pressed && styles.drawerItemPressed,
      ]}
    >
      <View style={styles.drawerItemIcon}>
        <MaterialCommunityIcons
          name={iconName}
          size={20}
          color={studentPalette.primary}
        />
      </View>
      <Text style={styles.drawerItemText}>{label}</Text>
      <MaterialCommunityIcons
        name="chevron-right"
        size={21}
        color={studentPalette.textMuted}
      />
    </Pressable>
  );
}

export function StudentDrawerNavigator({
  profile,
}: {
  profile: UserProfile | null;
}) {
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