import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { ProfileHeader, ProfileUserCard } from "../components/profile";
import { Screen } from "../components/Screen";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../navigation/routes";
import { RootStackParamList } from "../navigation/types";
import { getProfileBestEffort, UserProfile } from "../services/userService";

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.Profile>;

export function ProfileScreen({}: Props) {
  const { accessToken, user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);

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

  return (
    <Screen style={styles.container}>
      <ProfileHeader />
      <ProfileUserCard
        displayEmail={displayEmail}
        displayName={displayName}
        initial={initial}
        roleLabel={roleLabel}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
