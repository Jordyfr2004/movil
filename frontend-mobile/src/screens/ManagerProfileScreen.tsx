import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Screen } from "../components/Screen";
import { AppButton } from "../components/AppButton";
import { StatusBadge } from "../components/StatusBadge";
import { colors, typography } from "../theme";
import { spacing } from "../constants/spacing";
import { RootStackParamList } from "../navigation/types";
import { ROUTES } from "../navigation/routes";
import { useAuth } from "../context/AuthContex";
import { getProfileBestEffort, UserProfile } from "../services/userService";
import { getRestaurantById } from "../services/restaurantService";
import {
  deleteDish,
  Dish,
  getManagerDishes,
} from "../services/dishService";

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.ManagerProfile
>;

export function ManagerProfileScreen({ navigation }: Props) {
  const { logout, accessToken, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoadingDishes, setIsLoadingDishes] = useState(false);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [removingDishId, setRemovingDishId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [restaurantName, setRestaurantName] = useState<string>("");

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      if (!accessToken) {
        if (isActive) {
          setProfile(null);
          setRestaurantName("");
        }
        return;
      }

      try {
        const data = await getProfileBestEffort(accessToken, user?.user_id);
        if (!isActive) return;

        setProfile(data);

        const restaurantId = data?.restaurantId;
        if (restaurantId) {
          const restaurant = await getRestaurantById(String(restaurantId));
          if (isActive) {
            setRestaurantName(restaurant?.name ?? "");
          }
        } else {
          setRestaurantName("");
        }
      } catch {
        if (isActive) {
          setProfile(null);
          setRestaurantName("");
        }
      }
    };

    load();

    return () => {
      isActive = false;
    };
  }, [accessToken, user?.user_id]);

  const loadDishes = useCallback(async () => {
    if (!accessToken) {
      setDishes([]);
      return;
    }

    try {
      setIsLoadingDishes(true);
      const list = await getManagerDishes(accessToken);
      setDishes(list);
    } catch {
      setDishes([]);
    } finally {
      setIsLoadingDishes(false);
    }
  }, [accessToken]);

  useFocusEffect(
    useCallback(() => {
      loadDishes();
    }, [loadDishes])
  );

  const displayName = useMemo(() => {
    return profile?.fullName?.trim() || user?.email || "Usuario";
  }, [profile?.fullName, user?.email]);

  const displayEmail = useMemo(() => {
    return profile?.email?.trim() || user?.email || "";
  }, [profile?.email, user?.email]);

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
      navigation.reset({
        index: 0,
        routes: [{ name: ROUTES.Welcome }],
      });
    }
  };

  const handleRemoveDish = async (dishId: string) => {
    if (!accessToken) {
      Alert.alert("Sesión no disponible", "Vuelve a iniciar sesión.");
      return;
    }

    if (removingDishId) return;

    try {
      setRemovingDishId(dishId);
      await deleteDish(accessToken, dishId);
      await loadDishes();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el plato";
      Alert.alert("Error", message);
    } finally {
      setRemovingDishId(null);
    }
  };

  const confirmRemoveDish = (dish: Dish) => {
    Alert.alert(
      "Eliminar plato",
      `Se eliminará “${dish.name}”. ¿Deseas continuar?`,
      [
        { text: "Volver", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => handleRemoveDish(dish.id),
        },
      ]
    );
  };

  return (
    <Screen style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Mi perfil</Text>
          <Text style={styles.subtitle}>
            Administra tu restaurante y añade tus platos.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <View style={styles.profileText}>
              <Text style={styles.name} numberOfLines={1}>
                {displayName}
              </Text>
              <Text style={styles.email} numberOfLines={1}>
                {displayEmail}
              </Text>
            </View>
            <StatusBadge label="Manager" tone="success" />
          </View>

          <View style={styles.divider} />

          <View style={styles.field}>
            <Text style={styles.label}>Restaurante</Text>
            <Text style={styles.value} numberOfLines={2}>
              {restaurantName || "—"}
            </Text>
          </View>

          <View style={styles.actions}>
            <AppButton
              label="Añadir platos"
              onPress={() => navigation.navigate(ROUTES.AddDish)}
            />

            <AppButton
              label={isLoggingOut ? "Cerrando sesión…" : "Cerrar sesión"}
              onPress={handleLogout}
              variant="danger"
              disabled={isLoggingOut}
            />
          </View>
        </View>

        <View style={styles.dishesCard}>
          <View style={styles.dishesHeader}>
            <Text style={styles.dishesTitle}>Mis platos</Text>
            <Text style={styles.dishesSubtitle}>
              {isLoadingDishes
                ? "Cargando tus platos…"
                : dishes.length > 0
                  ? `Tienes ${dishes.length} plato${dishes.length === 1 ? "" : "s"}.`
                  : "Aún no has añadido platos."}
            </Text>
          </View>

          <FlatList
            data={dishes}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.dishesList}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.dishRow}>
                <View style={styles.dishText}>
                  <Text style={styles.dishName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.dishMeta} numberOfLines={1}>
                    ${item.price}
                  </Text>
                </View>

                <View style={styles.dishActions}>
                  <AppButton
                    label="Editar"
                    size="sm"
                    variant="secondary"
                    onPress={() =>
                      navigation.navigate(ROUTES.AddDish, {
                        dish: {
                          id: item.id,
                          name: item.name,
                          price: item.price,
                        },
                      })
                    }
                  />
                  <AppButton
                    label={
                      removingDishId === item.id ? "Eliminando…" : "Eliminar"
                    }
                    size="sm"
                    variant="danger"
                    disabled={Boolean(removingDishId)}
                    onPress={() => confirmRemoveDish(item)}
                  />
                </View>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyDishes}>
                <Text style={styles.emptyDishesTitle}>
                  {isLoadingDishes ? "Cargando…" : "Sin platos"}
                </Text>
                <Text style={styles.emptyDishesSubtitle}>
                  Pulsa “Añadir platos” para crear tu primer plato.
                </Text>
              </View>
            }
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.lg,
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeights.xl,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 1,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  profileText: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeights.md,
  },
  email: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  value: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    fontWeight: typography.weights.semiBold,
  },
  actions: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  dishesCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 1,
  },
  dishesHeader: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  dishesTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  dishesSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
  dishesList: {
    gap: spacing.sm,
  },
  dishRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dishText: {
    flex: 1,
    gap: 2,
  },
  dishName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
  },
  dishMeta: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  dishActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  emptyDishes: {
    paddingTop: spacing.md,
    gap: spacing.xs,
  },
  emptyDishesTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
  },
  emptyDishesSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
});
