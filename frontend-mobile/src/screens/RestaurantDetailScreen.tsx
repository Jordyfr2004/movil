import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import {
  RestaurantDetailHeader,
  RestaurantDetailSummary,
  RestaurantDishesSection,
} from "../components/restaurantDetail";
import { Screen } from "../components/Screen";
import { spacing } from "../constants/spacing";
import { useFavorites } from "../context/FavoritesContext";
import { useDishesByRestaurant } from "../hooks/useDishesByRestaurant";
import { ROUTES } from "../navigation/routes";
import { RootStackParamList } from "../navigation/types";
import { studentPalette } from "../theme/studentPalette";
import { designSystem } from "../theme";

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.RestaurantDetail
>;

export function RestaurantDetailScreen({ navigation, route }: Props) {
  const { restaurant } = route.params;
  const initial = restaurant.name?.trim()?.charAt(0)?.toUpperCase() ?? "R";
  const restaurantId = String(restaurant.id);
  const { isRestaurantFavorite, toggleRestaurant } = useFavorites();
  const favorite = isRestaurantFavorite(restaurant.id);

  const { dishes, loading, error, reload } = useDishesByRestaurant(restaurantId);

  return (
    <Screen style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <RestaurantDetailHeader initial={initial} restaurant={restaurant} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              favorite ? "Quitar restaurante favorito" : "Guardar restaurante favorito"
            }
            onPress={() => toggleRestaurant(restaurant)}
            style={styles.favoriteButton}
          >
            <MaterialCommunityIcons
              name={favorite ? "heart" : "heart-outline"}
              size={designSystem.iconSizes.md}
              color={designSystem.colors.primary}
            />
          </Pressable>
        </View>
        <RestaurantDetailSummary description={restaurant.description} />

        <RestaurantDishesSection
          dishes={dishes}
          error={error}
          isCheckingReservation={false}
          isReservingDishId={null}
          loading={loading}
          onReload={reload}
          onDishPress={(dish) =>
            navigation.navigate(ROUTES.FoodDetail, { restaurant, dish })
          }
          reservedDishIdSet={new Set()}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: studentPalette.background,
  },
  content: {
    gap: spacing.md,
    paddingBottom: spacing.giant,
  },
  scroll: {
    flex: 1,
    backgroundColor: "transparent",
  },
  favoriteButton: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: designSystem.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
  },
});
