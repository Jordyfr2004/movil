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
  assignManager,
  changeUserRole,
  getSuperAdminRestaurants,
  getSuperAdminUsers,
  SuperAdminRestaurant,
  SuperAdminUser,
} from "../services/superAdminService";
import {
  superAdminTestStyles as styles,
} from "./superAdminTestStyles";

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "No se pudo completar la acción";
}

function getRoleLabel(
  role: SuperAdminUser["role"]
): string {
  if (role === "MANAGER") {
    return "Manager";
  }

  if (role === "SUPER_ADMIN") {
    return "Superadministrador";
  }

  return "Estudiante";
}

export function SuperAdminUserRoleScreen() {
  const { accessToken } = useAuth();

  const [users, setUsers] =
    useState<SuperAdminUser[]>([]);

  const [restaurants, setRestaurants] =
    useState<SuperAdminRestaurant[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [processingUserId, setProcessingUserId] =
    useState<string | null>(null);

  const [assigningUserId, setAssigningUserId] =
    useState<string | null>(null);

  const [
    selectedRestaurantId,
    setSelectedRestaurantId,
  ] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    try {
      setLoading(true);

      const [
        usersResult,
        restaurantsResult,
      ] = await Promise.all([
        getSuperAdminUsers(accessToken),
        getSuperAdminRestaurants(accessToken),
      ]);

      setUsers(
        usersResult.filter(
          (user) =>
            user.role !== "SUPER_ADMIN"
        )
      );

      setRestaurants(
        restaurantsResult.filter(
          (restaurant) =>
            restaurant.isActive
        )
      );
    } catch (error: unknown) {
      Alert.alert(
        "Error",
        getErrorMessage(error)
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const startManagerAssignment = (
    user: SuperAdminUser
  ) => {
    if (user.status !== "ACTIVE") {
      Alert.alert(
        "Usuario no disponible",
        "El usuario debe estar activo para asignarlo como manager."
      );
      return;
    }

    if (restaurants.length === 0) {
      Alert.alert(
        "Sin restaurantes",
        "No existen restaurantes activos para asignar."
      );
      return;
    }

    setAssigningUserId(user.id);
    setSelectedRestaurantId(
      restaurants[0]?.id ?? null
    );
  };

  const cancelManagerAssignment = () => {
    setAssigningUserId(null);
    setSelectedRestaurantId(null);
  };

  const convertToManager = async (
    user: SuperAdminUser
  ) => {
    if (
      !accessToken ||
      !selectedRestaurantId
    ) {
      Alert.alert(
        "Restaurante requerido",
        "Selecciona un restaurante."
      );
      return;
    }

    try {
      setProcessingUserId(user.id);

      await assignManager(
        accessToken,
        user.id,
        selectedRestaurantId
      );

      cancelManagerAssignment();
      await loadData();

      Alert.alert(
        "Correcto",
        `${user.fullName} ahora es manager.`
      );
    } catch (error: unknown) {
      Alert.alert(
        "Error",
        getErrorMessage(error)
      );
    } finally {
      setProcessingUserId(null);
    }
  };

  const confirmConvertToStudent = (
    user: SuperAdminUser
  ) => {
    Alert.alert(
      "Cambiar a estudiante",
      `¿Deseas cambiar a ${user.fullName} al rol estudiante? Se eliminará su restaurante asignado.`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Confirmar",
          style: "destructive",
          onPress: () => {
            void convertToStudent(user);
          },
        },
      ]
    );
  };

  const convertToStudent = async (
    user: SuperAdminUser
  ) => {
    if (!accessToken) {
      return;
    }

    try {
      setProcessingUserId(user.id);

      await changeUserRole(
        accessToken,
        user.id,
        "STUDENT"
      );

      await loadData();

      Alert.alert(
        "Correcto",
        `${user.fullName} ahora es estudiante.`
      );
    } catch (error: unknown) {
      Alert.alert(
        "Error",
        getErrorMessage(error)
      );
    } finally {
      setProcessingUserId(null);
    }
  };

  return (
    <Screen style={styles.container}>
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>
          Cambiar roles
        </Text>

        <Text style={styles.subtitle}>
          Selecciona un estudiante para
          convertirlo en manager o un manager
          para convertirlo en estudiante.
        </Text>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => {
            void loadData();
          }}
        >
          <Text
            style={styles.secondaryButtonText}
          >
            Actualizar usuarios
          </Text>
        </Pressable>

        {loading ? (
          <ActivityIndicator
            style={styles.loading}
          />
        ) : users.length === 0 ? (
          <Text style={styles.empty}>
            No hay usuarios disponibles.
          </Text>
        ) : (
          users.map((user) => {
            const isProcessing =
              processingUserId === user.id;

            const isAssigning =
              assigningUserId === user.id;

            return (
              <View
                key={user.id}
                style={[
                  styles.card,
                  isAssigning &&
                    styles.selectedCard,
                ]}
              >
                <Text style={styles.cardTitle}>
                  {user.fullName}
                </Text>

                <Text style={styles.detail}>
                  Rol actual:{" "}
                  {getRoleLabel(user.role)}
                </Text>

                <Text style={styles.detail}>
                  Estado: {user.status}
                </Text>

                <Text style={styles.detail}>
                  Restaurante:{" "}
                  {user.restaurantName ??
                    "Sin asignar"}
                </Text>

                <Text
                  selectable
                  style={styles.identifier}
                >
                  {user.id}
                </Text>

                {user.role === "STUDENT" &&
                  !isAssigning && (
                    <Pressable
                      disabled={
                        isProcessing ||
                        user.status !== "ACTIVE"
                      }
                      style={[
                        styles.button,
                        (
                          isProcessing ||
                          user.status !== "ACTIVE"
                        ) &&
                          styles.disabled,
                      ]}
                      onPress={() =>
                        startManagerAssignment(
                          user
                        )
                      }
                    >
                      <Text
                        style={styles.buttonText}
                      >
                        Cambiar a manager
                      </Text>
                    </Pressable>
                  )}

                {user.role === "MANAGER" && (
                  <Pressable
                    disabled={isProcessing}
                    style={[
                      styles.dangerButton,
                      isProcessing &&
                        styles.disabled,
                    ]}
                    onPress={() =>
                      confirmConvertToStudent(
                        user
                      )
                    }
                  >
                    <Text
                      style={styles.buttonText}
                    >
                      {isProcessing
                        ? "Procesando..."
                        : "Cambiar a estudiante"}
                    </Text>
                  </Pressable>
                )}

                {isAssigning && (
                  <View style={styles.card}>
                    <Text
                      style={styles.sectionTitle}
                    >
                      Selecciona el restaurante
                    </Text>

                    {restaurants.map(
                      (restaurant) => {
                        const isSelected =
                          selectedRestaurantId ===
                          restaurant.id;

                        return (
                          <Pressable
                            key={restaurant.id}
                            style={[
                              styles.card,
                              isSelected &&
                                styles.selectedCard,
                            ]}
                            onPress={() =>
                              setSelectedRestaurantId(
                                restaurant.id
                              )
                            }
                          >
                            <Text
                              style={
                                styles.cardTitle
                              }
                            >
                              {restaurant.name}
                            </Text>

                            <Text
                              style={
                                styles.identifier
                              }
                            >
                              {restaurant.id}
                            </Text>
                          </Pressable>
                        );
                      }
                    )}

                    <View style={styles.row}>
                      <Pressable
                        disabled={isProcessing}
                        style={[
                          styles.secondaryButton,
                          styles.flexButton,
                        ]}
                        onPress={
                          cancelManagerAssignment
                        }
                      >
                        <Text
                          style={
                            styles.secondaryButtonText
                          }
                        >
                          Cancelar
                        </Text>
                      </Pressable>

                      <Pressable
                        disabled={
                          isProcessing ||
                          !selectedRestaurantId
                        }
                        style={[
                          styles.button,
                          styles.flexButton,
                          (
                            isProcessing ||
                            !selectedRestaurantId
                          ) &&
                            styles.disabled,
                        ]}
                        onPress={() => {
                          void convertToManager(
                            user
                          );
                        }}
                      >
                        <Text
                          style={
                            styles.buttonText
                          }
                        >
                          {isProcessing
                            ? "Procesando..."
                            : "Confirmar"}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </Screen>
  );
}