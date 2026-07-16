import React, { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";

import { ProfileHeader, ProfileUserCard } from "../components/profile";
import { Screen } from "../components/Screen";
import { spacing } from "../constants/spacing";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../navigation/routes";
import { getProfileBestEffort, UserProfile } from "../services/userService";
import { studentPalette } from "../theme/studentPalette";

type Props = {
  navigation: {
    navigate: (routeName: typeof ROUTES.MyReservations) => void;
  };
  bottomInset?: number;
};

export function ProfileScreen({ navigation, bottomInset = 0 }: Props) {
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
      </ScrollView>
    </Screen>
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
});
