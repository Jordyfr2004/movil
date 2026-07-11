import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Screen } from "../components/Screen";
import { spacing } from "../constants/spacing";
import { useAuth } from "../context/AuthContext";
import {
  assignManager,
  changeUserRole,
  getSuperAdminUsers,
  SuperAdminUser,
} from "../services/superAdminService";
import { studentPalette } from "../theme/studentPalette";

export function SuperAdminScreen() {
  const { accessToken, logout } = useAuth();

  const [users, setUsers] = useState<SuperAdminUser[]>([]);
  const [restaurantId, setRestaurantId] = useState("");
  const [loading, setLoading] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      const result = await getSuperAdminUsers(accessToken);
      setUsers(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudieron cargar usuarios";

      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const handleAssignManager = async (userId: string) => {
    if (!accessToken) return;

    const safeRestaurantId = restaurantId.trim();

    if (!safeRestaurantId) {
      Alert.alert(
        "Restaurante requerido",
        "Ingresa primero el UUID del restaurante."
      );
      return;
    }

    try {
      setUpdatingUserId(userId);

      await assignManager(
        accessToken,
        userId,
        safeRestaurantId
      );

      Alert.alert(
        "Correcto",
        "El usuario ahora es manager."
      );

      await loadUsers();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo asignar el manager";

      Alert.alert("Error", message);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleChangeToStudent = async (userId: string) => {
    if (!accessToken) return;

    try {
      setUpdatingUserId(userId);

      await changeUserRole(
        accessToken,
        userId,
        "STUDENT"
      );

      Alert.alert(
        "Correcto",
        "El usuario ahora es estudiante."
      );

      await loadUsers();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo cambiar el rol";

      Alert.alert("Error", message);
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Superadministrador</Text>
          <Text style={styles.subtitle}>
            Prueba básica de gestión de roles
          </Text>
        </View>

        <Pressable style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Salir</Text>
        </Pressable>
      </View>

      <TextInput
        value={restaurantId}
        onChangeText={setRestaurantId}
        placeholder="UUID del restaurante"
        autoCapitalize="none"
        style={styles.input}
      />

      <Pressable
        style={styles.reloadButton}
        onPress={() => void loadUsers()}
      >
        <Text style={styles.reloadText}>
          {loading ? "Cargando..." : "Actualizar usuarios"}
        </Text>
      </Pressable>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No hay usuarios disponibles.
          </Text>
        }
        renderItem={({ item }) => {
          const isUpdating = updatingUserId === item.id;

          return (
            <View style={styles.card}>
              <Text style={styles.userName}>
                {item.fullName}
              </Text>

              <Text style={styles.detail}>
                Rol: {item.role}
              </Text>

              <Text style={styles.detail}>
                Restaurante:{" "}
                {item.restaurantName ??
                  item.restaurantId ??
                  "Sin asignar"}
              </Text>

              {item.role === "STUDENT" && (
                <Pressable
                  disabled={isUpdating}
                  style={styles.primaryButton}
                  onPress={() =>
                    void handleAssignManager(item.id)
                  }
                >
                  <Text style={styles.primaryButtonText}>
                    {isUpdating
                      ? "Procesando..."
                      : "Convertir en manager"}
                  </Text>
                </Pressable>
              )}

              {item.role === "MANAGER" && (
                <Pressable
                  disabled={isUpdating}
                  style={styles.secondaryButton}
                  onPress={() =>
                    void handleChangeToStudent(item.id)
                  }
                >
                  <Text style={styles.secondaryButtonText}>
                    {isUpdating
                      ? "Procesando..."
                      : "Convertir en estudiante"}
                  </Text>
                </Pressable>
              )}
            </View>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: studentPalette.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: studentPalette.textPrimary,
  },
  subtitle: {
    color: studentPalette.textSecondary,
  },
  logoutButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  logoutText: {
    color: studentPalette.primary,
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    borderColor: studentPalette.border,
    borderRadius: 14,
    padding: spacing.md,
    backgroundColor: studentPalette.card,
    marginBottom: spacing.sm,
  },
  reloadButton: {
    padding: spacing.md,
    borderRadius: 14,
    backgroundColor: studentPalette.primary,
    alignItems: "center",
    marginBottom: spacing.md,
  },
  reloadText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  card: {
    padding: spacing.md,
    borderRadius: 18,
    backgroundColor: studentPalette.card,
    borderWidth: 1,
    borderColor: studentPalette.border,
    gap: spacing.sm,
  },
  userName: {
    fontSize: 17,
    fontWeight: "800",
    color: studentPalette.textPrimary,
  },
  detail: {
    color: studentPalette.textSecondary,
  },
  primaryButton: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: studentPalette.primary,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  secondaryButton: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: studentPalette.primary,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: studentPalette.primary,
    fontWeight: "700",
  },
  emptyText: {
    textAlign: "center",
    color: studentPalette.textSecondary,
    marginTop: spacing.xl,
  },
});