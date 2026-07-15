import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { Screen } from "../components/Screen";
import { useAuth } from "../context/AuthContext";
import {
  changeUserStatus,
  getSuperAdminUsers,
  SuperAdminUser,
  SuperAdminUserStatus,
} from "../services/superAdminService";
import {
  superAdminTestStyles as styles,
} from "./superAdminTestStyles";

export function SuperAdminUserStatusScreen() {
  const { accessToken } = useAuth();

  const [users, setUsers] =
    useState<SuperAdminUser[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [processingId, setProcessingId] =
    useState<string | null>(null);

  const loadUsers =
    useCallback(async () => {
      if (!accessToken) {
        return;
      }

      try {
        setLoading(true);

        const result =
          await getSuperAdminUsers(
            accessToken
          );

        setUsers(
          result.filter(
            (user) =>
              user.role !== "SUPER_ADMIN"
          )
        );
      } catch (error) {
        Alert.alert(
          "Error",
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los usuarios"
        );
      } finally {
        setLoading(false);
      }
    }, [accessToken]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const updateStatus = async (
    user: SuperAdminUser,
    status: SuperAdminUserStatus
  ) => {
    if (
      !accessToken ||
      user.status === status
    ) {
      return;
    }

    try {
      setProcessingId(user.id);

      await changeUserStatus(
        accessToken,
        user.id,
        status
      );

      await loadUsers();

      Alert.alert(
        "Correcto",
        "Estado actualizado."
      );
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el estado"
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Screen style={styles.container}>
      <ScrollView
        contentContainerStyle={
          styles.content
        }
      >
        <Text style={styles.title}>
          Estado de usuarios
        </Text>

        {loading ? (
          <ActivityIndicator
            style={styles.loading}
          />
        ) : (
          users.map((user) => (
            <View
              key={user.id}
              style={styles.card}
            >
              <Text style={styles.cardTitle}>
                {user.fullName}
              </Text>

              <Text style={styles.detail}>
                Estado actual: {user.status}
              </Text>

              <View style={styles.row}>
                <Pressable
                  disabled={
                    processingId !== null
                  }
                  style={[
                    styles.successButton,
                    styles.flexButton,
                    user.status ===
                      "ACTIVE" &&
                      styles.disabled,
                  ]}
                  onPress={() => {
                    void updateStatus(
                      user,
                      "ACTIVE"
                    );
                  }}
                >
                  <Text style={styles.buttonText}>
                    Activar
                  </Text>
                </Pressable>

                <Pressable
                  disabled={
                    processingId !== null
                  }
                  style={[
                    styles.secondaryButton,
                    styles.flexButton,
                    user.status ===
                      "INACTIVE" &&
                      styles.disabled,
                  ]}
                  onPress={() => {
                    void updateStatus(
                      user,
                      "INACTIVE"
                    );
                  }}
                >
                  <Text
                    style={
                      styles.secondaryButtonText
                    }
                  >
                    Inactivar
                  </Text>
                </Pressable>
              </View>

              <Pressable
                disabled={
                  processingId !== null
                }
                style={[
                  styles.dangerButton,
                  user.status ===
                    "SUSPENDED" &&
                    styles.disabled,
                ]}
                onPress={() => {
                  void updateStatus(
                    user,
                    "SUSPENDED"
                  );
                }}
              >
                <Text style={styles.buttonText}>
                  Suspender
                </Text>
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}