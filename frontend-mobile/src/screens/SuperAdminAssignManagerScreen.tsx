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
  assignManager,
  getSuperAdminRestaurants,
  getSuperAdminUsers,
  SuperAdminRestaurant,
  SuperAdminUser,
} from "../services/superAdminService";
import {
  superAdminTestStyles as styles,
} from "./superAdminTestStyles";

export function SuperAdminAssignManagerScreen() {
  const { accessToken } = useAuth();

  const [users, setUsers] =
    useState<SuperAdminUser[]>([]);

  const [restaurants, setRestaurants] =
    useState<SuperAdminRestaurant[]>([]);

  const [selectedUserId, setSelectedUserId] =
    useState<string | null>(null);

  const [
    selectedRestaurantId,
    setSelectedRestaurantId,
  ] = useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [processing, setProcessing] =
    useState(false);

  const loadData =
    useCallback(async () => {
      if (!accessToken) {
        return;
      }

      try {
        setLoading(true);

        const [
          userResult,
          restaurantResult,
        ] = await Promise.all([
          getSuperAdminUsers(
            accessToken
          ),
          getSuperAdminRestaurants(
            accessToken
          ),
        ]);

        setUsers(
          userResult.filter(
            (user) =>
              user.role === "STUDENT" &&
              user.status === "ACTIVE"
          )
        );

        setRestaurants(
          restaurantResult.filter(
            (restaurant) =>
              restaurant.isActive
          )
        );
      } catch (error) {
        Alert.alert(
          "Error",
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los datos"
        );
      } finally {
        setLoading(false);
      }
    }, [accessToken]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const confirmAssignment = async () => {
    if (
      !accessToken ||
      !selectedUserId ||
      !selectedRestaurantId
    ) {
      Alert.alert(
        "Datos incompletos",
        "Selecciona un usuario y un restaurante."
      );
      return;
    }

    try {
      setProcessing(true);

      await assignManager(
        accessToken,
        selectedUserId,
        selectedRestaurantId
      );

      setSelectedUserId(null);
      setSelectedRestaurantId(null);

      await loadData();

      Alert.alert(
        "Correcto",
        "Manager asignado correctamente."
      );
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "No se pudo asignar el manager"
      );
    } finally {
      setProcessing(false);
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
          Asignar manager
        </Text>

        {loading ? (
          <ActivityIndicator
            style={styles.loading}
          />
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              Selecciona un estudiante activo
            </Text>

            {users.map((user) => (
              <Pressable
                key={user.id}
                style={[
                  styles.card,
                  selectedUserId ===
                    user.id &&
                    styles.selectedCard,
                ]}
                onPress={() =>
                  setSelectedUserId(user.id)
                }
              >
                <Text style={styles.cardTitle}>
                  {user.fullName}
                </Text>

                <Text style={styles.identifier}>
                  {user.id}
                </Text>
              </Pressable>
            ))}

            <Text style={styles.sectionTitle}>
              Selecciona un restaurante activo
            </Text>

            {restaurants.map(
              (restaurant) => (
                <Pressable
                  key={restaurant.id}
                  style={[
                    styles.card,
                    selectedRestaurantId ===
                      restaurant.id &&
                      styles.selectedCard,
                  ]}
                  onPress={() =>
                    setSelectedRestaurantId(
                      restaurant.id
                    )
                  }
                >
                  <Text style={styles.cardTitle}>
                    {restaurant.name}
                  </Text>
                </Pressable>
              )
            )}

            <Pressable
              disabled={processing}
              style={[
                styles.button,
                processing &&
                  styles.disabled,
              ]}
              onPress={() => {
                void confirmAssignment();
              }}
            >
              <Text style={styles.buttonText}>
                {processing
                  ? "Asignando..."
                  : "Confirmar asignación"}
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}