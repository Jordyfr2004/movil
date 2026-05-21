import React, { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { ROUTES } from "./routes";
import { colors, typography } from "../theme";
import { spacing } from "../constants/spacing";
import { UserProfile } from "../services/userService";
import { useAuth } from "../context/AuthContex";
import { StudentStackNavigator } from "./StudentStackNavigator";

type StudentDrawerParamList = {
  StudentStack: undefined;
};

const Drawer = createDrawerNavigator<StudentDrawerParamList>();

function StudentDrawerContent({
  profile,
  ...props
}: DrawerContentComponentProps & { profile: UserProfile | null }) {
  const { user, logout } = useAuth();
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

  const handleGoToProfile = () => {
    props.navigation.closeDrawer();
    (props.navigation as any).navigate("StudentStack", {
      screen: ROUTES.Profile,
    });
  };

  const handleGoTo = (routeName: (typeof ROUTES)[keyof typeof ROUTES]) => {
    props.navigation.closeDrawer();
    (props.navigation as any).navigate("StudentStack", {
      screen: routeName,
    });
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);
      props.navigation.closeDrawer();
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
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ir al perfil"
        onPress={handleGoToProfile}
        style={({ pressed }) => [
          styles.userRow,
          pressed && styles.userRowPressed,
        ]}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>

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
      </Pressable>

      <View style={styles.divider} />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ir a Mis reservas"
        onPress={() => handleGoTo(ROUTES.MyReservations)}
        style={({ pressed }) => [styles.drawerItem, pressed && styles.drawerItemPressed]}
      >
        <MaterialCommunityIcons name="calendar-check" size={20} color={colors.textPrimary} />
        <Text style={styles.drawerItemText}>Mis reservas</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ir a Acelerómetro"
        onPress={() => handleGoTo(ROUTES.SensorMovimiento)}
        style={({ pressed }) => [styles.drawerItem, pressed && styles.drawerItemPressed]}
      >
        <MaterialCommunityIcons name="axis-arrow" size={20} color={colors.textPrimary} />
        <Text style={styles.drawerItemText}>Acelerómetro</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ir a Evidencias"
        onPress={() => handleGoTo(ROUTES.Evidence)}
        style={({ pressed }) => [styles.drawerItem, pressed && styles.drawerItemPressed]}
      >
        <MaterialCommunityIcons name="image-multiple" size={20} color={colors.textPrimary} />
        <Text style={styles.drawerItemText}>Evidencias</Text>
      </Pressable>

      <View style={styles.grow} />

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
        <MaterialCommunityIcons
          name="logout-variant"
          size={20}
          color={colors.error}
        />
        <Text style={styles.drawerItemTextDanger}>
          {isLoggingOut ? "Cerrando sesión…" : "Cerrar sesión"}
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
          backgroundColor: colors.surface,
        },
      }}
      drawerContent={(props) => <StudentDrawerContent {...props} profile={profile} />}
    >
      <Drawer.Screen name="StudentStack" component={StudentStackNavigator} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    flexGrow: 1,
  },
  grow: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 16,
  },
  userRowPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  userText: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeights.md,
  },
  userEmail: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 14,
  },
  drawerItemPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  drawerItemDisabled: {
    opacity: 0.7,
  },
  drawerItemText: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    fontWeight: typography.weights.semiBold,
    lineHeight: typography.lineHeights.md,
  },
  drawerItemTextDanger: {
    fontSize: typography.sizes.md,
    color: colors.error,
    fontWeight: typography.weights.semiBold,
    lineHeight: typography.lineHeights.md,
  },
});
