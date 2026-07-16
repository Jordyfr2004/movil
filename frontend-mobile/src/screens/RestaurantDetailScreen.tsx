import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import {
  RestaurantDetailHeader,
  RestaurantDetailSummary,
  RestaurantDishesSection,
} from "../components/restaurantDetail";
import { Screen } from "../components/Screen";
import { spacing } from "../constants/spacing";
import { useDishesByRestaurant } from "../hooks/useDishesByRestaurant";
import { ROUTES } from "../navigation/routes";
import { RootStackParamList } from "../navigation/types";
import { studentPalette } from "../theme/studentPalette";

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.RestaurantDetail
>;

export function RestaurantDetailScreen({ navigation, route }: Props) {
  const { restaurant } = route.params;
  const initial = restaurant.name?.trim()?.charAt(0)?.toUpperCase() ?? "R";
  const restaurantId = String(restaurant.id);

  const { dishes, loading, error, reload } = useDishesByRestaurant(restaurantId);

  return (
    <Screen style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <RestaurantDetailHeader initial={initial} restaurant={restaurant} />
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
    paddingBottom: spacing.xxxl,
  },
  scroll: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
