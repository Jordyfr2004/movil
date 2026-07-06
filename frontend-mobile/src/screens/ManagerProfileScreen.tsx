import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, FlatList, ListRenderItem, StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Svg, { Path } from "react-native-svg";

import {
  ManagerDishCard,
  ManagerDishesFeedback,
  ManagerProfileListHeader,
} from "../components/managerProfile";
import { Screen } from "../components/Screen";
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
import { studentPalette } from "../theme/studentPalette";

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.ManagerProfile
>;

export function ManagerProfileScreen({ navigation }: Props) {
  const { accessToken, user } = useAuth();
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

  const visibleDishesCount = useMemo(() => {
    return dishes.filter((dish) => dish.isAvailable).length;
  }, [dishes]);

  const handleEditDish = useCallback(
    (dish: Dish) => {
      navigation.navigate(ROUTES.AddDish, {
        dish: {
          id: dish.id,
          name: dish.name,
          description: dish.description,
          price: dish.price,
        },
      });
    },
    [navigation]
  );

  const handleRemoveDish = useCallback(
    async (dishId: string) => {
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
    },
    [accessToken, loadDishes, removingDishId]
  );

  const confirmRemoveDish = useCallback(
    (dish: Dish) => {
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
    },
    [handleRemoveDish]
  );

  const handleToggleHidden = useCallback(
    async (dish: Dish, nextHiddenValue: boolean) => {
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
    },
    [accessToken, togglingDishId]
  );

  const renderDish: ListRenderItem<Dish> = useCallback(
    ({ item }) => (
      <ManagerDishCard
        dish={item}
        isRemoving={removingDishId === item.id}
        isRemovingDisabled={Boolean(removingDishId)}
        isInteractionDisabled={Boolean(togglingDishId) || Boolean(removingDishId)}
        onEdit={() => handleEditDish(item)}
        onRemove={() => confirmRemoveDish(item)}
        onToggleHidden={(value) => handleToggleHidden(item, value)}
      />
    ),
    [
      confirmRemoveDish,
      handleEditDish,
      handleToggleHidden,
      removingDishId,
      togglingDishId,
    ]
  );

  return (
    <Screen style={styles.container}>
      <View
        style={styles.backgroundDecor}
        pointerEvents="none"
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Svg
          width="100%"
          height={126}
          viewBox="0 0 360 126"
          preserveAspectRatio="none"
          style={styles.backgroundWave}
        >
          <Path
            d="M0 0 H360 V66 C292 94 224 40 148 64 C84 86 38 86 0 66 Z"
            fill={studentPalette.backgroundStrong}
          />
        </Svg>
      </View>

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
          <ManagerProfileListHeader
            displayName={displayName}
            displayEmail={displayEmail}
            initial={initial}
            restaurantName={restaurantName}
            isLoadingDishes={isLoadingDishes}
            dishesCount={dishes.length}
            visibleDishesCount={visibleDishesCount}
          />
        }
        renderItem={renderDish}
        ListEmptyComponent={
          <ManagerDishesFeedback
            isLoadingDishes={isLoadingDishes}
            dishesError={dishesError}
            onRetry={loadDishes}
            style={styles.feedbackState}
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: studentPalette.background,
  },
  backgroundDecor: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  backgroundWave: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  feedbackState: {
    marginTop: spacing.sm,
    borderRadius: 22,
    borderColor: studentPalette.border,
    backgroundColor: studentPalette.card,
    shadowColor: studentPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
});
