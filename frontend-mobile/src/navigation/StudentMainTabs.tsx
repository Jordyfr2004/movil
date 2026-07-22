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
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DrawerActions } from "@react-navigation/native";

import {
  CartFloatingBar,
  EmptyState,
  ErrorState,
  RestaurantCard,
  ScreenContainer,
  SectionHeader,
} from "../components";
import { spacing } from "../constants/spacing";
import { useFavorites } from "../context/FavoritesContext";
import { useRestaurants } from "../hooks/useRestaurants";
import { useReduceMotion } from "../hooks/useReduceMotion";
import { useThemeColors } from "../hooks/useThemeColors";
import { Dish } from "../services/dishService";
import { MyReservationsScreen } from "../screens/MyReservationsScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { HomeContent } from "../screens/HomeScreen";
import { ExploreScreen } from "../screens/ExploreScreen";
import { designSystem, typography } from "../theme";
import { Restaurant } from "../types/models";

import { ROUTES } from "./routes";
import { StudentStackParamList } from "./types";

type Props = NativeStackScreenProps<StudentStackParamList, typeof ROUTES.Home>;

type TabKey = "home" | "explore" | "orders" | "favorites" | "profile";

type FavoriteRow =
  | {
      key: string;
      type: "restaurant";
      restaurant: Restaurant;
    }
  | {
      key: string;
      type: "dish";
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
  const bottomInset = TAB_BAR_HEIGHT + tabBottomPadding;

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
            onOpenDish={openRestaurant}
            onOpenRestaurant={openRestaurant}
          />
        ) : null}

        {activeTab === "explore" ? (
          <ExploreScreen
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
          size={24}
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
  const [favoriteTab, setFavoriteTab] = useState<"restaurants" | "dishes">(
    "restaurants"
  );
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

  const rows = useMemo<FavoriteRow[]>(() => {
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

    return favoriteTab === "restaurants" ? restaurantRows : dishRows;
  }, [favoriteDishes, favoriteRestaurants, favoriteTab, restaurantById]);

  const hasFavorites =
    favoriteTab === "restaurants"
      ? favoriteRestaurants.length > 0
      : favoriteDishes.length > 0;

  return (
    <ScreenContainer bottomInset={bottomInset} contentStyle={styles.favorites}>
      <SectionHeader
        title="Favoritos"
        subtitle="Tus restaurantes y platos guardados"
      />

      <View style={styles.favoriteTabs}>
        {[
          { key: "restaurants" as const, label: "Restaurantes" },
          { key: "dishes" as const, label: "Platos" },
        ].map((tab) => {
          const active = favoriteTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={tab.label}
              onPress={() => setFavoriteTab(tab.key)}
              style={styles.favoriteTab}
            >
              <Text
                style={[
                  styles.favoriteTabText,
                  { color: active ? theme.primary : theme.textSecondary },
                ]}
              >
                {tab.label}
              </Text>
              <View
                style={[
                  styles.favoriteTabIndicator,
                  active && { backgroundColor: theme.primary },
                ]}
              />
            </Pressable>
          );
        })}
      </View>

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
            title="Sin favoritos todavÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­a"
            message={
              favoriteTab === "restaurants"
                ? "Cuando guardes restaurantes aparecerÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡n aquÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­."
                : "Cuando guardes platos aparecerÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡n aquÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­."
            }
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
                    <Image
                      source={{ uri: item.dish.imageUrl }}
                      style={styles.resultImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.resultImage} />
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
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: TAB_BAR_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: 3,
    borderTopWidth: 1,
    shadowColor: "rgba(80, 47, 24, 0.12)",
    shadowOpacity: 1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 0,
    minHeight: 44,
    minWidth: 0,
  },
  tabButtonPressed: {
    opacity: 0.82,
  },
  tabIconWrap: {
    width: 32,
    height: 28,
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
    gap: spacing.sm,
  },
  exploreHeader: {
    gap: 2,
    paddingTop: 0,
  },
  exploreTitle: {
    fontSize: 27,
    lineHeight: 33,
    fontWeight: typography.weights.extraBold,
  },
  exploreSubtitle: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: typography.weights.semiBold,
  },
  searchRow: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  searchBar: {
    flex: 1,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
    backgroundColor: designSystem.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
    ...designSystem.shadows.low,
  },
  searchFilterButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    ...designSystem.shadows.low,
  },
  filterActiveDot: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 6,
    height: 6,
    borderRadius: 999,
  },
  searchInput: {
    flex: 1,
    minHeight: 44,
    fontSize: 14,
    paddingVertical: 0,
  },
  searchClearButton: {
    width: 36,
    height: 36,
    borderRadius: designSystem.radii.pill,
    alignItems: "center",
    justifyContent: "center",
    flexGrow: 0,
    flexShrink: 0,
  },
  filterScroller: {
    maxHeight: 42,
    flexGrow: 0,
    flexShrink: 0,
  },
  filterRow: {
    gap: spacing.sm,
    minHeight: 40,
    maxHeight: 42,
    alignItems: "center",
    paddingRight: 56,
    paddingBottom: 2,
  },
  exploreFilterChip: {
    height: 36,
    maxHeight: 38,
    alignSelf: "flex-start",
    flexGrow: 0,
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: designSystem.radii.pill,
    borderWidth: 1,
  },
  exploreFilterText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: typography.weights.bold,
  },
  activeFiltersRow: {
    minHeight: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  activeFiltersText: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: typography.weights.semiBold,
  },
  activeFiltersClear: {
    minHeight: 24,
    justifyContent: "center",
  },
  activeFiltersClearText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: typography.weights.bold,
  },
  resultsSummaryText: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: typography.weights.semiBold,
  },
  filterModalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.42)",
  },
  filterModalSheet: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    ...designSystem.shadows.medium,
  },
  filterModalHeader: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  filterModalTitle: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: typography.weights.extraBold,
  },
  filterModalIconButton: {
    width: 44,
    height: 44,
    borderRadius: designSystem.radii.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  filterModalOptions: {
    gap: spacing.sm,
  },
  filterModalSection: {
    gap: spacing.xs,
  },
  filterModalSectionTitle: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: typography.weights.bold,
    textTransform: "uppercase",
  },
  filterModalOptionGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  filterModalOption: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    borderRadius: designSystem.radii.pill,
    borderWidth: 1,
  },
  filterModalOptionText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: typography.weights.bold,
  },
  filterModalActions: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  filterModalSecondaryAction: {
    flex: 0.35,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
  },
  filterModalActionText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: typography.weights.bold,
  },
  filterModalApply: {
    flex: 0.65,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  filterModalApplyText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: typography.weights.extraBold,
  },
  exploreList: {
    gap: spacing.md,
    paddingTop: 0,
  },
  exploreSection: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  exploreSectionHeader: {
    minHeight: 26,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  exploreSectionTitle: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: typography.weights.extraBold,
  },
  exploreSectionAction: {
    minHeight: 26,
    justifyContent: "center",
  },
  exploreSectionActionText: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: typography.weights.bold,
  },
  restaurantRow: {
    minHeight: 90,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    padding: 9,
    borderRadius: 16,
    borderWidth: 1,
    ...designSystem.shadows.low,
  },
  restaurantRowImage: {
    width: 76,
    height: 74,
    borderRadius: 13,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: 11,
    lineHeight: 14,
    fontWeight: typography.weights.bold,
  },
  resultName: {
    color: designSystem.colors.textPrimary,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: typography.weights.extraBold,
  },
  resultDescription: {
    color: designSystem.colors.textSecondary,
    fontSize: 12,
    lineHeight: 15,
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
    fontSize: 14,
    lineHeight: 17,
    fontWeight: typography.weights.extraBold,
  },
  resultStatus: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: typography.weights.bold,
  },
  restaurantMetaRow: {
    minHeight: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  restaurantFavorite: {
    width: 42,
    height: 42,
    borderRadius: designSystem.radii.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  dishCarousel: {
    gap: spacing.sm,
    paddingRight: spacing.xxxl,
  },
  exploreDishCard: {
    width: 148,
    height: 182,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    ...designSystem.shadows.low,
  },
  exploreDishMedia: {
    height: 102,
    margin: spacing.xs,
    marginBottom: 0,
    borderRadius: 14,
    overflow: "hidden",
  },
  exploreDishFavorite: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 42,
    height: 42,
    borderRadius: designSystem.radii.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  exploreDishBody: {
    flex: 1,
    justifyContent: "flex-start",
    gap: 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  exploreDishPrice: {
    marginTop: "auto",
  },
  skeletonTextStack: {
    flex: 1,
    gap: spacing.xs,
  },
  skeletonLineLarge: {
    width: "78%",
    height: 16,
    borderRadius: designSystem.radii.pill,
  },
  skeletonLine: {
    width: "62%",
    height: 12,
    borderRadius: designSystem.radii.pill,
  },
  skeletonLineShort: {
    width: "38%",
    height: 12,
    borderRadius: designSystem.radii.pill,
  },
  skeletonDishRow: {
    flexDirection: "row",
    gap: spacing.sm,
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
  favoriteTabs: {
    flexDirection: "row",
    alignItems: "flex-end",
    minHeight: 42,
  },
  favoriteTab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacing.xs,
  },
  favoriteTabText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  favoriteTabIndicator: {
    width: "72%",
    height: 3,
    borderRadius: 999,
    backgroundColor: "transparent",
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
