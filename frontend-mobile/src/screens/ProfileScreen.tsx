import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { ProfileHeader, ProfileUserCard } from "../components/profile";
import { Screen } from "../components/Screen";
import { spacing } from "../constants/spacing";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../navigation/routes";
import { getProfileBestEffort, UserProfile } from "../services/userService";
import { designSystem, typography } from "../theme";
import { studentPalette } from "../theme/studentPalette";

type Props = {
  navigation: {
    navigate: (routeName: string) => void;
  };
  bottomInset?: number;
  onOpenFavorites?: () => void;
};

export function ProfileScreen({
  navigation,
  bottomInset = 0,
  onOpenFavorites,
}: Props) {
  const { accessToken, logout, user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadProfile = async () => {
      if (!accessToken) {
        setProfile(null);
        return;
      }

      try {
        const data = await getProfileBestEffort(accessToken, user?.user_id);
        if (isActive) {
          setProfile(data);
        }
      } catch {
        if (isActive) {
          setProfile(null);
        }
      }
    };

    loadProfile();

    return () => {
      isActive = false;
    };
  }, [accessToken, user?.user_id]);

  const displayName = useMemo(() => {
    return profile?.fullName?.trim() || user?.email || "Usuario";
  }, [profile?.fullName, user?.email]);

  const displayEmail = useMemo(() => {
    return profile?.email?.trim() || user?.email || "";
  }, [profile?.email, user?.email]);

  const roleLabel = useMemo(() => {
    if (profile?.role === "student") {
      return "Estudiante";
    }

    if (profile?.role === "admin") {
      return "Administrador";
    }

    return "Usuario";
  }, [profile?.role]);

  const initial = useMemo(() => {
    const source = displayName || displayEmail;
    return source?.trim()?.charAt(0)?.toUpperCase() ?? "U";
  }, [displayName, displayEmail]);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);
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
    <Screen style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomInset + spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader />
        <ProfileUserCard
          displayEmail={displayEmail}
          displayName={displayName}
          initial={initial}
          isLoggingOut={isLoggingOut}
          onLogout={handleLogout}
          onOpenReservations={() => navigation.navigate(ROUTES.MyReservations)}
          roleLabel={roleLabel}
        />

        <View style={styles.actionsCard}>
          <ProfileAction
            iconName="heart-outline"
            label="Favoritos"
            onPress={() => {
              if (onOpenFavorites) {
                onOpenFavorites();
                return;
              }
              navigation.navigate(ROUTES.Home);
            }}
          />
          <ProfileAction
            iconName="bell-outline"
            label="Notificaciones"
            onPress={() => navigation.navigate(ROUTES.Notifications)}
          />
          <ProfileAction
            iconName="theme-light-dark"
            label="Apariencia"
            onPress={() => navigation.navigate(ROUTES.Appearance)}
          />
          <ProfileAction
            iconName="help-circle-outline"
            label="Ayuda"
            onPress={() => navigation.navigate(ROUTES.Help)}
          />
          <ProfileAction
            iconName="book-open-page-variant-outline"
            label="Onboarding"
            onPress={() => navigation.navigate(ROUTES.OnboardingReview)}
          />
          <ProfileAction
            iconName="star-outline"
            label="Calificaciones pendientes"
            onPress={() => navigation.navigate(ROUTES.LocalPending)}
          />
          <ProfileAction
            iconName="alert-circle-outline"
            label="Reportes pendientes"
            onPress={() => navigation.navigate(ROUTES.LocalPending)}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

function ProfileAction({
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
      style={({ pressed }) => [styles.actionRow, pressed && styles.actionPressed]}
    >
      <View style={styles.actionIcon}>
        <MaterialCommunityIcons
          name={iconName}
          size={designSystem.iconSizes.md}
          color={designSystem.colors.primary}
        />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
      <MaterialCommunityIcons
        name="chevron-right"
        size={designSystem.iconSizes.md}
        color={designSystem.colors.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: studentPalette.backgroundSoft,
  },
  content: {
    gap: spacing.sm,
  },
  scroll: {
    flex: 1,
    backgroundColor: "transparent",
  },
  actionsCard: {
    marginTop: spacing.md,
    borderRadius: 20,
    backgroundColor: designSystem.colors.surface,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
    overflow: "hidden",
    ...designSystem.shadows.sm,
  },
  actionRow: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  actionPressed: {
    backgroundColor: designSystem.colors.surfacePressed,
  },
  actionIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: designSystem.colors.primaryFaint,
  },
  actionLabel: {
    flex: 1,
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
});
