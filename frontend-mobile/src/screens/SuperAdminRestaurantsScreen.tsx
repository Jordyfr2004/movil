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
  TextInput,
  View,
} from "react-native";

import { Screen } from "../components/Screen";
import { useAuth } from "../context/AuthContext";
import {
  createSuperAdminRestaurant,
  getSuperAdminRestaurants,
  SuperAdminRestaurant,
  updateSuperAdminRestaurantName,
  updateSuperAdminRestaurantStatus,
} from "../services/superAdminService";
import {
  superAdminTestStyles as styles,
} from "./superAdminTestStyles";

function getMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "No se pudo completar la acción";
}

export function SuperAdminRestaurantsScreen() {
  const { accessToken } = useAuth();

  const [restaurants, setRestaurants] =
    useState<SuperAdminRestaurant[]>([]);

  const [newName, setNewName] =
    useState("");

  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const [editName, setEditName] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [processing, setProcessing] =
    useState(false);

  const selectedRestaurant =
    restaurants.find(
      (restaurant) =>
        restaurant.id === selectedId
    ) ?? null;

  const loadRestaurants =
    useCallback(async () => {
      if (!accessToken) {
        return;
      }

      try {
        setLoading(true);

        const result =
          await getSuperAdminRestaurants(
            accessToken
          );

        setRestaurants(result);
      } catch (error) {
        Alert.alert(
          "Error",
          getMessage(error)
        );
      } finally {
        setLoading(false);
      }
    }, [accessToken]);

  useEffect(() => {
    void loadRestaurants();
  }, [loadRestaurants]);

  const createRestaurant = async () => {
    if (!accessToken) {
      return;
    }

    const name = newName.trim();

    if (!name) {
      Alert.alert(
        "Nombre requerido",
        "Ingresa el nombre del restaurante."
      );
      return;
    }

    try {
      setProcessing(true);

      await createSuperAdminRestaurant(
        accessToken,
        {
          name,
          is_active: true,
        }
      );

      setNewName("");
      await loadRestaurants();

      Alert.alert(
        "Correcto",
        "Restaurante creado."
      );
    } catch (error) {
      Alert.alert(
        "Error",
        getMessage(error)
      );
    } finally {
      setProcessing(false);
    }
  };

  const selectRestaurant = (
    restaurant: SuperAdminRestaurant
  ) => {
    setSelectedId(restaurant.id);
    setEditName(restaurant.name);
  };

  const saveName = async () => {
    if (
      !accessToken ||
      !selectedRestaurant
    ) {
      return;
    }

    const name = editName.trim();

    if (!name) {
      Alert.alert(
        "Nombre requerido",
        "Ingresa un nombre."
      );
      return;
    }

    try {
      setProcessing(true);

      await updateSuperAdminRestaurantName(
        accessToken,
        selectedRestaurant.id,
        name
      );

      await loadRestaurants();

      Alert.alert(
        "Correcto",
        "Nombre actualizado."
      );
    } catch (error) {
      Alert.alert(
        "Error",
        getMessage(error)
      );
    } finally {
      setProcessing(false);
    }
  };

  const toggleStatus = async () => {
    if (
      !accessToken ||
      !selectedRestaurant
    ) {
      return;
    }

    try {
      setProcessing(true);

      await updateSuperAdminRestaurantStatus(
        accessToken,
        selectedRestaurant.id,
        !selectedRestaurant.isActive
      );

      await loadRestaurants();

      Alert.alert(
        "Correcto",
        selectedRestaurant.isActive
          ? "Restaurante desactivado."
          : "Restaurante activado."
      );
    } catch (error) {
      Alert.alert(
        "Error",
        getMessage(error)
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
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>
          Restaurantes
        </Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Crear restaurante
          </Text>

          <TextInput
            value={newName}
            onChangeText={setNewName}
            placeholder="Nombre"
            style={styles.input}
          />

          <Pressable
            disabled={processing}
            style={[
              styles.button,
              processing &&
                styles.disabled,
            ]}
            onPress={() => {
              void createRestaurant();
            }}
          >
            <Text style={styles.buttonText}>
              Crear
            </Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => {
            void loadRestaurants();
          }}
        >
          <Text
            style={styles.secondaryButtonText}
          >
            Actualizar lista
          </Text>
        </Pressable>

        {loading ? (
          <ActivityIndicator
            style={styles.loading}
          />
        ) : restaurants.length === 0 ? (
          <Text style={styles.empty}>
            No hay restaurantes.
          </Text>
        ) : (
          restaurants.map((restaurant) => (
            <Pressable
              key={restaurant.id}
              style={[
                styles.card,
                selectedId ===
                  restaurant.id &&
                  styles.selectedCard,
              ]}
              onPress={() =>
                selectRestaurant(restaurant)
              }
            >
              <Text style={styles.cardTitle}>
                {restaurant.name}
              </Text>

              <Text style={styles.detail}>
                Estado:{" "}
                {restaurant.isActive
                  ? "Activo"
                  : "Inactivo"}
              </Text>

              <Text
                selectable
                style={styles.identifier}
              >
                {restaurant.id}
              </Text>
            </Pressable>
          ))
        )}

        {selectedRestaurant ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Restaurante seleccionado
            </Text>

            <TextInput
              value={editName}
              onChangeText={setEditName}
              style={styles.input}
            />

            <Pressable
              disabled={processing}
              style={styles.button}
              onPress={() => {
                void saveName();
              }}
            >
              <Text style={styles.buttonText}>
                Guardar nombre
              </Text>
            </Pressable>

            <Pressable
              disabled={processing}
              style={
                selectedRestaurant.isActive
                  ? styles.dangerButton
                  : styles.successButton
              }
              onPress={() => {
                void toggleStatus();
              }}
            >
              <Text style={styles.buttonText}>
                {selectedRestaurant.isActive
                  ? "Desactivar"
                  : "Activar"}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}