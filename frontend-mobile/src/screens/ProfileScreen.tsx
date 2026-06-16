import React, { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Svg, { Path } from "react-native-svg";

import { ProfileHeader, ProfileUserCard } from "../components/profile";
import { Screen } from "../components/Screen";
import { spacing } from "../constants/spacing";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../navigation/routes";
import { RootStackParamList } from "../navigation/types";
import { getProfileBestEffort, UserProfile } from "../services/userService";
import { studentPalette } from "../theme/studentPalette";

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.Profile>;

export function ProfileScreen({ navigation }: Props) {
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
      <View
        style={styles.backgroundDecor}
        pointerEvents="none"
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Svg
          width="100%"
          height={120}
          viewBox="0 0 360 120"
          preserveAspectRatio="none"
          style={styles.backgroundWave}
        >
          <Path
            d="M0 0 H360 V62 C296 88 232 36 158 58 C94 80 47 84 0 66 Z"
            fill={studentPalette.backgroundStrong}
          />
        </Svg>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
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
    backgroundColor: studentPalette.background,
  },
  backgroundDecor: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  backgroundWave: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
  },
  content: {
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
});
