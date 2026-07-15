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
} from "react-native";

import { Screen } from "../components/Screen";
import { useAuth } from "../context/AuthContext";
import {
  getSuperAdminUsers,
  SuperAdminUser,
} from "../services/superAdminService";
import {
  superAdminTestStyles as styles,
} from "./superAdminTestStyles";

export function SuperAdminUsersScreen() {
  const { accessToken } = useAuth();

  const [users, setUsers] =
    useState<SuperAdminUser[]>([]);

  const [loading, setLoading] =
    useState(true);

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

        setUsers(result);
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

  return (
    <Screen style={styles.container}>
      <ScrollView
        contentContainerStyle={
          styles.content
        }
      >
        <Text style={styles.title}>
          Usuarios
        </Text>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => {
            void loadUsers();
          }}
        >
          <Text
            style={styles.secondaryButtonText}
          >
            Actualizar
          </Text>
        </Pressable>

        {loading ? (
          <ActivityIndicator
            style={styles.loading}
          />
        ) : users.length === 0 ? (
          <Text style={styles.empty}>
            No hay usuarios.
          </Text>
        ) : (
          users.map((user) => (
            <ViewUser
              key={user.id}
              user={user}
            />
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

function ViewUser({
  user,
}: {
  user: SuperAdminUser;
}) {
  return (
    <Text style={styles.card}>
      <Text style={styles.cardTitle}>
        {user.fullName}
      </Text>

      {"\n"}
      <Text style={styles.detail}>
        Rol: {user.role}
      </Text>

      {"\n"}
      <Text style={styles.detail}>
        Estado: {user.status}
      </Text>

      {"\n"}
      <Text style={styles.detail}>
        Restaurante:{" "}
        {user.restaurantName ??
          "Sin asignar"}
      </Text>

      {"\n"}
      <Text style={styles.identifier}>
        {user.id}
      </Text>
    </Text>
  );
}