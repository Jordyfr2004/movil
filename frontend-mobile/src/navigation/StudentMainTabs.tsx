import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  CartFloatingBar,
  EmptyState,
  ErrorState,
  FilterChip,
  RestaurantCard,
  ScreenContainer,
  SectionHeader,
  PremiumSkeleton,
} from "../components";
import { spacing } from "../constants/spacing";
import { useFavorites } from "../context/FavoritesContext";
import { useRestaurants } from "../hooks/useRestaurants";
import { useReduceMotion } from "../hooks/useReduceMotion";
import { useThemeColors } from "../hooks/useThemeColors";
import { Dish, getPublicDishesByRestaurant } from "../services/dishService";
import { MyReservationsScreen } from "../screens/MyReservationsScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { HomeContent } from "../screens/HomeScreen";
import { designSystem, typography } from "../theme";
import { Restaurant } from "../types/models";
import { ROUTES } from "./routes";
import { StudentStackParamList } from "./types";

type Props = NativeStackScreenProps<StudentStackParamList, typeof ROUTES.Home>;

type TabKey = "home" | "explore" | "orders" | "favorites" | "profile";

type ExploreResult = {
  key: string;
  restaurant: Restaurant;
  dish: Dish;
};

const TAB_BAR_HEIGHT = 58;

const TABS: Array<{
  key: TabKey;
  label: string;
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  activeIconName: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
}> = [
  { key: "home", label: "Inicio", iconName: "home-variant-outline", activeIconName: "home-variant" },
  { key: "explore", label: "Explorar", iconName: "compass-outline", activeIconName: "compass" },
  { key: "orders", label: "Pedidos", iconName: "receipt-text-outline", activeIconName: "receipt-text" },
  { key: "favorites", label: "Favoritos", iconName: "heart-outline", activeIconName: "heart" },
  { key: "profile", label: "Perfil", iconName: "account-outline", activeIconName: "account" },
];

export function StudentMainTabs({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();
  const tabBottomPadding = Math.max(insets.bottom, spacing.xs);
  const bottomInset = TAB_BAR_HEIGHT + tabBottomPadding + spacing.md;

  const openRestaurant = (restaurant: Restaurant, dish?: Dish) => {
    if (dish) {
      navigation.navigate(ROUTES.FoodDetail, { restaurant, dish });
      return;
    }

    navigation.navigate(ROUTES.RestaurantDetail, { restaurant });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TabScene activeTab={activeTab}>
        {activeTab === "home" ? (
          <HomeContent
            bottomInset={bottomInset}
            onOpenExplore={() => setActiveTab("explore")}
            onOpenNotifications={() => navigation.navigate(ROUTES.Notifications)}
            onOpenOrders={() => setActiveTab("orders")}
            onOpenProfile={() => setActiveTab("profile")}
            onOpenRestaurant={openRestaurant}
          />
        ) : null}

        {activeTab === "explore" ? (
          <ExploreTab
            bottomInset={bottomInset}
            onOpenRestaurant={openRestaurant}
          />
        ) : null}

        {activeTab === "orders" ? (
          <MyReservationsScreen bottomInset={bottomInset} />
        ) : null}

        {activeTab === "favorites" ? (
          <FavoritesTab
            bottomInset={bottomInset}
            onExplore={() => setActiveTab("explore")}
            onOpenRestaurant={openRestaurant}
          />
        ) : null}

        {activeTab === "profile" ? (
          <ProfileScreen
            navigation={navigation}
            bottomInset={bottomInset}
            onOpenFavorites={() => setActiveTab("favorites")}
          />
        ) : null}
      </TabScene>

      <View
        style={[
          styles.tabBar,
          {
            paddingBottom: tabBottomPadding,
            backgroundColor: theme.surfaceElevated,
            borderColor: theme.border,
          },
        ]}
      >
        {TABS.map((tab) => (
          <TabButton
            key={tab.key}
            active={activeTab === tab.key}
            iconName={tab.iconName}
            activeIconName={tab.activeIconName}
            label={tab.label}
            onPress={() => setActiveTab(tab.key)}
          />
        ))}
      </View>

      <CartFloatingBar
        bottomOffset={bottomInset + spacing.sm}
        onPress={() => navigation.navigate(ROUTES.Cart)}
      />
    </View>
  );
}

function TabScene({
  activeTab,
  children,
}: {
  activeTab: TabKey;
  children: React.ReactNode;
}) {
  const reduceMotion = useReduceMotion();
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1);
      return;
    }

    opacity.setValue(0.82);
    Animated.timing(opacity, {
      toValue: 1,
      duration: designSystem.animation.fast,
      useNativeDriver: true,
    }).start();
  }, [activeTab, opacity, reduceMotion]);

  return <Animated.View style={[styles.scene, { opacity }]}>{children}</Animated.View>;
}

function TabButton({
  active,
  iconName,
  activeIconName,
  label,
  onPress,
}: {
  active: boolean;
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  activeIconName: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  onPress: () => void;
}) {
  const theme = useThemeColors();
  const scale = useRef(new Animated.Value(active ? 1 : 0)).current;
  const reduceMotion = useReduceMotion();

  useEffect(() => {
    if (reduceMotion) {
      scale.setValue(active ? 1 : 0);
      return;
    }

    Animated.timing(scale, {
      toValue: active ? 1 : 0,
      duration: designSystem.animation.fast,
      useNativeDriver: true,
    }).start();
  }, [active, reduceMotion, scale]);

  const indicatorScale = scale.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tabButton,
        pressed && styles.tabButtonPressed,
      ]}
    >
      <Animated.View
        style={[
          styles.tabIconWrap,
          active && {
            backgroundColor: theme.primaryFaint,
            borderColor: theme.primarySoft,
            borderWidth: 1,
          },
          { transform: [{ scale: indicatorScale }] },
        ]}
      >
        <MaterialCommunityIcons
          name={active ? activeIconName : iconName}
          size={designSystem.iconSizes.sm}
          color={
            active
              ? theme.primary
              : theme.textMuted
          }
        />
      </Animated.View>
      <Text
        style={[
          styles.tabLabel,
          { color: active ? theme.primary : theme.textMuted },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function ExploreTab({
  bottomInset,
  onOpenRestaurant,
}: {
  bottomInset: number;
  onOpenRestaurant: (restaurant: Restaurant, dish?: Dish) => void;
}) {
  const theme = useThemeColors();
  const { restaurants, loading, error, reload } = useRestaurants();
  const [dishResults, setDishResults] = useState<ExploreResult[]>([]);
  const [dishLoading, setDishLoading] = useState(false);
  const [dishError, setDishError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string | null>(null);

  const loadDishes = useCallback(async () => {
    if (restaurants.length === 0) {
      setDishResults([]);
      setDishError(null);
      return;
    }

    setDishLoading(true);
    setDishError(null);

    try {
      const settled = await Promise.allSettled(
        restaurants.map(async (restaurant) => {
          const dishes = await getPublicDishesByRestaurant(String(restaurant.id));
          return dishes.map((dish) => ({
            key: `${restaurant.id}-${dish.id}`,
            restaurant,
            dish,
          }));
        })
      );

      const nextResults = settled.flatMap((result) =>
        result.status === "fulfilled" ? result.value : []
      );
      const hasRejected = settled.some((result) => result.status === "rejected");

      setDishResults(nextResults);
      setDishError(
        hasRejected && nextResults.length === 0
          ? "No se pudieron cargar los platos."
          : null
      );
    } catch (reason: unknown) {
      setDishResults([]);
      setDishError(
        reason instanceof Error
          ? reason.message
          : "No se pudieron cargar los platos."
      );
    } finally {
      setDishLoading(false);
    }
  }, [restaurants]);

  useEffect(() => {
    void loadDishes();
  }, [loadDishes]);

  const categories = useMemo(() => {
    const values = dishResults
      .map((result) => result.dish.category?.trim())
      .filter((value): value is string => Boolean(value));
    return Array.from(new Set(values));
  }, [dishResults]);

  const filteredResults = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return dishResults.filter(({ dish, restaurant }) => {
      const price = Number(dish.price.replace(",", "."));
      const matchesQuery =
        !normalizedQuery ||
        dish.name.toLowerCase().includes(normalizedQuery) ||
        restaurant.name.toLowerCase().includes(normalizedQuery);
      const matchesFilter =
        !filter ||
        (filter === "available" && dish.isActive && dish.isAvailable) ||
        (filter === "under3" && Number.isFinite(price) && price < 3) ||
        (filter === "under5" && Number.isFinite(price) && price < 5) ||
        (filter === "restaurant" && Boolean(restaurant.name)) ||
        dish.category === filter;

      return matchesQuery && matchesFilter;
    });
  }, [dishResults, filter, query]);

  const isLoading = loading || dishLoading;
  const resolvedError = error ?? dishError;

  return (
    <ScreenContainer bottomInset={bottomInset} contentStyle={styles.explore}>
      <SectionHeader
        title="Explorar"
        subtitle="Todos los restaurantes activos"
      />

      <View
        style={[
          styles.searchBar,
          {
            backgroundColor: theme.surfaceElevated,
            borderColor: theme.border,
          },
        ]}
      >
        <MaterialCommunityIcons
          name="magnify"
          size={designSystem.iconSizes.sm}
          color={theme.textMuted}
        />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar restaurante o plato"
          placeholderTextColor={theme.textMuted}
          style={[styles.searchInput, { color: theme.textPrimary }]}
        />
      </View>

      <View style={styles.filterRow}>
        <FilterChip
          label="Disponible"
          iconName="check-circle-outline"
          selected={filter === "available"}
          onPress={() => setFilter(filter === "available" ? null : "available")}
        />
        <FilterChip
          label="Menos de $3"
          iconName="cash"
          selected={filter === "under3"}
          onPress={() => setFilter(filter === "under3" ? null : "under3")}
        />
        <FilterChip
          label="Menos de $5"
          iconName="cash-multiple"
          selected={filter === "under5"}
          onPress={() => setFilter(filter === "under5" ? null : "under5")}
        />
        <FilterChip
          label="Restaurante"
          iconName="storefront-outline"
          selected={filter === "restaurant"}
          onPress={() =>
            setFilter(filter === "restaurant" ? null : "restaurant")
          }
        />
        {categories.map((category) => (
          <FilterChip
            key={category}
            label={category}
            selected={filter === category}
            onPress={() => setFilter(filter === category ? null : category)}
          />
        ))}
        {(filter || query) ? (
          <FilterChip
            label="Limpiar"
            iconName="close"
            onPress={() => {
              setFilter(null);
              setQuery("");
            }}
          />
        ) : null}
      </View>

      {isLoading ? (
        <View style={styles.feedbackStack}>
          <PremiumSkeleton kind="restaurant" />
          <PremiumSkeleton kind="dish" />
        </View>
      ) : resolvedError ? (
        <ErrorState
          title="No se pudieron cargar los resultados"
          message={resolvedError}
          onRetry={() => {
            void reload().then(loadDishes);
          }}
          style={styles.feedbackState}
        />
      ) : filteredResults.length === 0 ? (
        <EmptyState
          title="Sin resultados"
          message="Prueba con otra búsqueda o limpia los filtros."
          iconName="food-off-outline"
          actionLabel="Limpiar filtros"
          onActionPress={() => {
            setFilter(null);
            setQuery("");
          }}
          style={styles.feedbackState}
        />
      ) : (
        <FlatList
          style={styles.flexList}
          data={filteredResults}
          keyExtractor={(item) => item.key}
          renderItem={({ item, index }) => (
            <ExploreDishResult
              result={item}
              index={index}
              onOpenDish={(restaurant, dish) =>
                onOpenRestaurant(restaurant, dish)
              }
            />
          )}
          contentContainerStyle={[
            styles.exploreList,
            { paddingBottom: bottomInset + spacing.xxl },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenContainer>
  );
}

function ExploreDishResult({
  index,
  onOpenDish,
  result,
}: {
  index: number;
  result: ExploreResult;
  onOpenDish: (restaurant: Restaurant, dish: Dish) => void;
}) {
  const theme = useThemeColors();
  const reduceMotion = useReduceMotion();
  const opacity = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(reduceMotion ? 0 : 10)).current;

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: designSystem.animation.normal,
        delay: Math.min(index * 35, 160),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: designSystem.animation.normal,
        delay: Math.min(index * 35, 160),
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, opacity, reduceMotion, translateY]);

  const { dish, restaurant } = result;
  const { isDishFavorite, toggleDish } = useFavorites();
  const isAvailable = dish.isActive && dish.isAvailable;
  const favorite = isDishFavorite(dish.id);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver ${dish.name}`}
        onPress={() => onOpenDish(restaurant, dish)}
        style={({ pressed }) => [
          styles.resultCard,
          {
            backgroundColor: theme.surfaceElevated,
            borderColor: theme.border,
          },
          pressed && styles.resultPressed,
          pressed && { backgroundColor: theme.primaryFaint },
        ]}
      >
        <View
          style={[
            styles.resultMedia,
            { backgroundColor: theme.surfaceSecondary },
          ]}
        >
          {dish.imageUrl ? (
            <Image source={{ uri: dish.imageUrl }} style={styles.resultImage} />
          ) : (
            <MaterialCommunityIcons
              name="food-outline"
              size={designSystem.iconSizes.lg}
              color={theme.primary}
            />
          )}
        </View>
        <View style={styles.resultText}>
          <Text
            style={[styles.resultRestaurant, { color: theme.primary }]}
            numberOfLines={1}
          >
            {restaurant.name}
          </Text>
          <Text
            style={[styles.resultName, { color: theme.textPrimary }]}
            numberOfLines={2}
          >
            {dish.name}
          </Text>
          {dish.description ? (
            <Text
              style={[styles.resultDescription, { color: theme.textSecondary }]}
              numberOfLines={1}
            >
              {dish.description}
            </Text>
          ) : null}
          <View style={styles.resultMeta}>
            <Text style={[styles.resultPrice, { color: theme.primary }]}>
              ${dish.price}
            </Text>
            <Text
              style={[
              {
                color: isAvailable ? theme.success : theme.neutral,
              },
              ]}
            >
              {isAvailable ? "Disponible" : "No disponible"}
            </Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={favorite ? "Quitar favorito" : "Guardar favorito"}
          onPress={(event) => {
            event.stopPropagation();
            toggleDish(restaurant, dish);
          }}
          style={[
            styles.resultFavorite,
            {
              backgroundColor: theme.surfaceSecondary,
              borderColor: theme.border,
            },
          ]}
        >
          <MaterialCommunityIcons
          name={favorite ? "heart" : "heart-outline"}
          size={designSystem.iconSizes.md}
          color={theme.primary}
        />
        </Pressable>
        <MaterialCommunityIcons
          name="chevron-right"
          size={designSystem.iconSizes.md}
          color={theme.textMuted}
        />
      </Pressable>
    </Animated.View>
  );
}

function FavoritesTab({
  bottomInset,
  onExplore,
  onOpenRestaurant,
}: {
  bottomInset: number;
  onExplore: () => void;
  onOpenRestaurant: (restaurant: Restaurant, dish?: Dish) => void;
}) {
  const theme = useThemeColors();
  const { restaurants: favoriteRestaurants, dishes: favoriteDishes } =
    useFavorites();
  const { restaurants } = useRestaurants();
  const reduceMotion = useReduceMotion();
  const opacity = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const scale = useRef(new Animated.Value(reduceMotion ? 1 : 0.96)).current;

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1);
      scale.setValue(1);
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: designSystem.animation.normal,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: designSystem.animation.normal,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, reduceMotion, scale]);

  const restaurantById = useMemo(() => {
    return new Map(restaurants.map((item) => [String(item.id), item]));
  }, [restaurants]);

  const rows = useMemo(() => {
    const restaurantRows = favoriteRestaurants.map((item) => ({
      key: `restaurant-${item.id}`,
      type: "restaurant" as const,
      restaurant:
        restaurantById.get(item.id) ??
        ({
          id: item.id,
          name: item.name,
          isActive: item.isActive ?? false,
          imageUrl: item.imageUrl,
          location: item.location,
          description: item.description,
        } satisfies Restaurant),
    }));

    const dishRows = favoriteDishes.map((item) => {
      const restaurant =
        restaurantById.get(item.restaurantId) ??
        ({
          id: item.restaurantId,
          name: item.restaurantName,
          isActive: false,
        } satisfies Restaurant);

      const dish: Dish = {
        id: item.id,
        restaurantId: item.restaurantId,
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.imageUrl,
        isAvailable: item.isAvailable ?? false,
        isActive: item.isActive ?? false,
      };

      return {
        key: `dish-${item.id}`,
        type: "dish" as const,
        restaurant,
        dish,
      };
    });

    return [
      ...(restaurantRows.length
        ? [{ key: "section-restaurants", type: "section" as const, title: "Restaurantes" }]
        : []),
      ...restaurantRows,
      ...(dishRows.length
        ? [{ key: "section-dishes", type: "section" as const, title: "Platos" }]
        : []),
      ...dishRows,
    ];
  }, [favoriteDishes, favoriteRestaurants, restaurantById]);

  const hasFavorites = favoriteRestaurants.length > 0 || favoriteDishes.length > 0;

  return (
    <ScreenContainer bottomInset={bottomInset} contentStyle={styles.favorites}>
      <SectionHeader
        title="Favoritos"
        subtitle="Tus restaurantes y platos guardados"
      />

      {!hasFavorites ? (
        <View style={styles.emptyCenter}>
        <Animated.View
          style={[
            styles.emptyState,
            {
              opacity,
              transform: [{ scale }],
            },
          ]}
        >
          <View style={styles.favoriteIllustration}>
            <View style={styles.favoriteIconMain}>
              <MaterialCommunityIcons
                name="heart-outline"
                size={designSystem.iconSizes.lg}
                color={theme.primary}
              />
            </View>
            <View style={styles.favoriteIconSmall}>
              <MaterialCommunityIcons
                name="storefront-outline"
                size={designSystem.iconSizes.sm}
                color={theme.secondary}
              />
            </View>
          </View>
          <EmptyState
            title="Sin favoritos todavía"
            message="Cuando guardes restaurantes aparecerán aquí."
            actionLabel="Explorar restaurantes"
            onActionPress={onExplore}
          />
        </Animated.View>
      </View>
      ) : (
        <FlatList
          style={styles.flexList}
          data={rows}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ gap: spacing.sm, paddingBottom: bottomInset + spacing.xxl }}
          renderItem={({ item }) => {
            if (item.type === "section") {
              return (
                <Text
                  style={[
                    styles.favoriteSectionTitle,
                    { color: theme.textPrimary },
                  ]}
                >
                  {item.title}
                </Text>
              );
            }

            if (item.type === "restaurant") {
              return (
                <RestaurantCard
                  restaurant={item.restaurant}
                  compact
                  onPress={() => onOpenRestaurant(item.restaurant)}
                />
              );
            }

            const available =
              item.restaurant.isActive && item.dish.isActive && item.dish.isAvailable;

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Ver ${item.dish.name}`}
                onPress={() => onOpenRestaurant(item.restaurant, item.dish)}
                style={({ pressed }) => [
                  styles.favoriteDishCard,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  },
                  pressed && styles.resultPressed,
                  pressed && { backgroundColor: theme.primaryFaint },
                ]}
              >
                <View
                  style={[
                    styles.resultMedia,
                    { backgroundColor: theme.surfaceSecondary },
                  ]}
                >
                  {item.dish.imageUrl ? (
                    <Image source={{ uri: item.dish.imageUrl }} style={styles.resultImage} />
                  ) : (
                    <MaterialCommunityIcons
                      name="food-outline"
                      size={designSystem.iconSizes.lg}
                      color={theme.primary}
                    />
                  )}
                </View>
                <View style={styles.resultText}>
                  <Text
                    style={[styles.resultRestaurant, { color: theme.primary }]}
                    numberOfLines={1}
                  >
                    {item.restaurant.name}
                  </Text>
                  <Text
                    style={[styles.resultName, { color: theme.textPrimary }]}
                    numberOfLines={2}
                  >
                    {item.dish.name}
                  </Text>
                  <View style={styles.resultMeta}>
                    <Text style={[styles.resultPrice, { color: theme.primary }]}>
                      ${item.dish.price}
                    </Text>
                    <Text
                      style={[
                        { color: available ? theme.success : theme.neutral },
                      ]}
                    >
                      {available ? "Disponible" : "No disponible"}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scene: {
    flex: 1,
  },
  tabBar: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.xs,
    minHeight: TAB_BAR_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
    borderRadius: designSystem.radii.xl,
    borderWidth: 1,
    ...designSystem.shadows.medium,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    minWidth: 0,
  },
  tabButtonPressed: {
    opacity: 0.82,
  },
  tabIconWrap: {
    width: 30,
    height: 30,
    borderRadius: designSystem.radii.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: typography.weights.semiBold,
  },
  explore: {
    gap: spacing.md,
  },
  searchBar: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: designSystem.radii.xl,
    backgroundColor: designSystem.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
    ...designSystem.shadows.low,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.roles.bodySmall.fontSize,
    paddingVertical: spacing.sm,
  },
  filterRow: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap",
    paddingBottom: spacing.xs,
  },
  exploreList: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  resultCard: {
    minHeight: 108,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: designSystem.radii.xl,
    backgroundColor: designSystem.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
    ...designSystem.shadows.low,
  },
  resultPressed: {
    transform: [{ scale: 0.99 }],
    backgroundColor: designSystem.colors.primaryFaint,
  },
  resultMedia: {
    width: 84,
    height: 84,
    borderRadius: designSystem.radii.image,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: designSystem.colors.surfaceSecondary,
  },
  resultImage: {
    width: "100%",
    height: "100%",
  },
  resultText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  resultRestaurant: {
    color: designSystem.colors.primary,
    fontSize: typography.roles.caption.fontSize,
    fontWeight: typography.weights.bold,
  },
  resultName: {
    color: designSystem.colors.textPrimary,
    fontSize: typography.roles.cardTitle.fontSize,
    lineHeight: typography.roles.cardTitle.lineHeight,
    fontWeight: typography.roles.cardTitle.fontWeight,
  },
  resultDescription: {
    color: designSystem.colors.textSecondary,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
  },
  resultMeta: {
    marginTop: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  resultFavorite: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: designSystem.colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
  },
  resultPrice: {
    color: designSystem.colors.primary,
    fontSize: typography.roles.price.fontSize,
    lineHeight: typography.roles.price.lineHeight,
    fontWeight: typography.roles.price.fontWeight,
  },
  resultStatus: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  flexList: {
    flex: 1,
    backgroundColor: "transparent",
  },
  feedbackStack: {
    gap: spacing.md,
  },
  feedbackState: {
    marginTop: spacing.md,
  },
  favorites: {
    gap: spacing.sm,
  },
  emptyCenter: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: TAB_BAR_HEIGHT + spacing.xl,
  },
  emptyState: {
    width: "100%",
    maxWidth: 360,
    alignSelf: "center",
  },
  favoriteIllustration: {
    alignSelf: "center",
    width: 78,
    height: 62,
    marginBottom: spacing.sm,
  },
  favoriteSectionTitle: {
    marginTop: spacing.sm,
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  favoriteDishCard: {
    minHeight: 94,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: 18,
    backgroundColor: designSystem.colors.surface,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
    ...designSystem.shadows.sm,
  },
  favoriteIconMain: {
    position: "absolute",
    left: 4,
    bottom: 0,
    width: 58,
    height: 58,
    borderRadius: designSystem.radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: designSystem.colors.primaryFaint,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
  },
  favoriteIconSmall: {
    position: "absolute",
    right: 0,
    top: 4,
    width: 34,
    height: 34,
    borderRadius: designSystem.radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: designSystem.colors.secondarySoft,
    borderWidth: 1,
    borderColor: "rgba(36, 107, 97, 0.14)",
  },
});
