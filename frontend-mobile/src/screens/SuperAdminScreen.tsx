import React, {
  useState,
} from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
} from "react-native";
import {
  NativeStackScreenProps,
} from "@react-navigation/native-stack";

import { Screen } from "../components/Screen";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../navigation/routes";
import {
  RootStackParamList,
} from "../navigation/types";
import {
  superAdminTestStyles as styles,
} from "./superAdminTestStyles";

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.SuperAdmin
>;

export function SuperAdminScreen({
  navigation,
}: Props) {
  const { logout } = useAuth();

  const [
    isLoggingOut,
    setIsLoggingOut,
  ] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Deseas cerrar la sesión?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Cerrar sesión",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              await logout();
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Screen style={styles.container}>
      <ScrollView
        contentContainerStyle={
          styles.content
        }
      >
        <Text style={styles.title}>
          Superadministrador
        </Text>

        <Text style={styles.subtitle}>
          Selecciona una funcionalidad para
          probarla con el backend.
        </Text>

        <Pressable
          style={styles.button}
          onPress={() =>
            navigation.navigate(
              ROUTES.SuperAdminRestaurants
            )
          }
        >
          <Text style={styles.buttonText}>
            Restaurantes
          </Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={() =>
            navigation.navigate(
              ROUTES.SuperAdminUsers
            )
          }
        >
          <Text style={styles.buttonText}>
            Consultar usuarios
          </Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={() =>
            navigation.navigate(
              ROUTES.SuperAdminAssignManager
            )
          }
        >
          <Text style={styles.buttonText}>
            Asignar manager
          </Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={() =>
            navigation.navigate(
              ROUTES.SuperAdminUserRole
            )
          }
        >
          <Text style={styles.buttonText}>
            Cambiar rol
          </Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={() =>
            navigation.navigate(
              ROUTES.SuperAdminUserStatus
            )
          }
        >
          <Text style={styles.buttonText}>
            Cambiar estado de usuario
          </Text>
        </Pressable>

        <Pressable
          disabled={isLoggingOut}
          style={[
            styles.dangerButton,
            isLoggingOut &&
              styles.disabled,
          ]}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>
            {isLoggingOut
              ? "Cerrando..."
              : "Cerrar sesión"}
          </Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}