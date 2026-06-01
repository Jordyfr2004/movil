import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, FlatList, StyleSheet, Switch, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AppButton } from "../components/AppButton";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { ErrorMessage } from "../components/ErrorMessage";
import { LoadingState } from "../components/LoadingState";
import { Screen } from "../components/Screen";
import { StatusBadge } from "../components/StatusBadge";
import { spacing } from "../constants/spacing";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../navigation/routes";
import { RootStackParamList } from "../navigation/types";
import {
  deleteDish,
  Dish,
  getManagerDishes,
  updateDish,
} from "../services/dishService";
import { getRestaurantById } from "../services/restaurantService";
import { getProfileBestEffort, UserProfile } from "../services/userService";
import { colors, typography } from "../theme";

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
  const [togglingDishId, setTogglingDishId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [restaurantName, setRestaurantName] = useState("");
  const [dishesError, setDishesError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadProfile = async () => {
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
        } else if (isActive) {
          setRestaurantName("");
        }
      } catch {
        if (isActive) {
          setProfile(null);
          setRestaurantName("");
        }
      }
    };

    loadProfile();

    return () => {
      isActive = false;
    };
  }, [accessToken, user?.user_id]);

  const loadDishes = useCallback(async () => {
    if (!accessToken) {
      setDishes([]);
      setDishesError(null);
      return;
    }

    try {
      setIsLoadingDishes(true);
      const list = await getManagerDishes(accessToken);
      setDishes(list);
      setDishesError(null);
    } catch (error) {
      setDishes([]);
      setDishesError(
        error instanceof Error ? error.message : "No se pudieron cargar los platos"
      );
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
        error instanceof Error ? error.message : "No se pudo eliminar el plato";
      Alert.alert("Error", message);
    } finally {
      setRemovingDishId(null);
    }
  };

  const confirmRemoveDish = (dish: Dish) => {
    Alert.alert(
      "Eliminar plato",
      `Se eliminará "${dish.name}". ¿Deseas continuar?`,
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

  const handleToggleHidden = async (dish: Dish, nextHiddenValue: boolean) => {
    if (!accessToken) {
      Alert.alert("Sesión no disponible", "Vuelve a iniciar sesión.");
      return;
    }

    if (togglingDishId) {
      return;
    }

    const nextIsAvailable = !nextHiddenValue;
    const previousIsAvailable = dish.isAvailable;

    try {
      setTogglingDishId(dish.id);

      setDishes((previous) =>
        previous.map((item) =>
          String(item.id) === String(dish.id)
            ? { ...item, isAvailable: nextIsAvailable }
            : item
        )
      );

      await updateDish(accessToken, dish.id, {
        is_available: nextIsAvailable,
      });
    } catch (error) {
      setDishes((previous) =>
        previous.map((item) =>
          String(item.id) === String(dish.id)
            ? { ...item, isAvailable: previousIsAvailable }
            : item
        )
      );

      const message =
        error instanceof Error ? error.message : "No se pudo actualizar el plato";
      Alert.alert("Error", message);
    } finally {
      setTogglingDishId(null);
    }
  };

  return (
    <Screen style={styles.container}>
      <FlatList
        data={dishes}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        initialNumToRender={12}
        windowSize={7}
        maxToRenderPerBatch={12}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Mi perfil</Text>
              <Text style={styles.subtitle}>
                Administra tu restaurante y añade tus platos.
              </Text>
            </View>

            <Card>
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
                  {restaurantName || "-"}
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
            </Card>

            <Card style={styles.dishesCard}>
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
            </Card>
          </>
        }
        renderItem={({ item }) => (
          <Card style={[styles.dishesCard, styles.dishesCardInner]}>
            <View style={styles.dishRow}>
              <View style={styles.dishText}>
                <Text style={styles.dishName} numberOfLines={1}>
                  {item.name}
                </Text>
                {item.description ? (
                  <Text style={styles.dishDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}
                <Text style={styles.dishMeta} numberOfLines={1}>
                  ${item.price}
                </Text>
              </View>

              <View style={styles.dishActions}>
                <View style={styles.dishToggleRow}>
                  <StatusBadge
                    label={item.isAvailable ? "Visible" : "Oculto"}
                    tone={item.isAvailable ? "success" : "danger"}
                  />

                  <View style={styles.toggleContainer}>
                    <Text style={styles.toggleLabel}>Ocultar</Text>
                    <Switch
                      value={!item.isAvailable}
                      onValueChange={(value) => handleToggleHidden(item, value)}
                      disabled={Boolean(togglingDishId) || Boolean(removingDishId)}
                    />
                  </View>
                </View>

                <AppButton
                  label="Editar"
                  size="sm"
                  variant="secondary"
                  onPress={() =>
                    navigation.navigate(ROUTES.AddDish, {
                      dish: {
                        id: item.id,
                        name: item.name,
                        description: item.description,
                        price: item.price,
                      },
                    })
                  }
                />
                <AppButton
                  label={removingDishId === item.id ? "Eliminando…" : "Eliminar"}
                  size="sm"
                  variant="danger"
                  disabled={Boolean(removingDishId)}
                  onPress={() => confirmRemoveDish(item)}
                />
              </View>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          isLoadingDishes ? (
            <LoadingState
              message="Cargando tus platos…"
              style={styles.feedbackState}
            />
          ) : dishesError ? (
            <ErrorMessage
              title="No se pudieron cargar los platos"
              message={dishesError}
              onRetry={loadDishes}
              style={styles.feedbackState}
            />
          ) : (
            <EmptyState
              title="Sin platos"
              message='Pulsa "Añadir platos" para crear tu primer plato.'
              iconName="food-outline"
              style={styles.feedbackState}
            />
          )
        }
      />
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
  feedbackState: {
    marginTop: spacing.lg,
  },
  dishesCardInner: {
    marginTop: 0,
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
  dishDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
  dishActions: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  dishToggleRow: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  toggleLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
});
