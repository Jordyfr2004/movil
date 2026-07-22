import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  ImageSourcePropType,
  ImageStyle,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  StyleProp,
  Text,
  TextInput,
  View,
  ViewStyle,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState, ErrorState, ScreenContainer } from "../components";
import { spacing } from "../constants/spacing";
import { useFavorites } from "../context/FavoritesContext";
import { useRestaurants } from "../hooks/useRestaurants";
import { useReduceMotion } from "../hooks/useReduceMotion";
import { useThemeColors } from "../hooks/useThemeColors";
import { Dish, getPublicDishesByRestaurant } from "../services/dishService";
import { designSystem, typography } from "../theme";
import { Restaurant } from "../types/models";
import { triggerFeedback } from "../utils/haptics";
import { getDishImageSource, getRestaurantImageSource } from "../utils/foodImages";

type ExploreScreenProps = {
  bottomInset: number;
  onOpenRestaurant: (restaurant: Restaurant, dish?: Dish) => void;
};

type ExploreResult = {
  key: string;
  restaurant: Restaurant;
  dish: Dish;
  originalIndex: number;
};

type ResultType = "all" | "restaurants" | "dishes";
type BudgetPreset = "none" | "2" | "3" | "5" | "custom";
type DishAvailability = "all" | "available";
type SortMode = "relevance" | "priceAsc" | "priceDesc" | "nameAsc";

type AdvancedFilters = {
  budgetPreset: BudgetPreset;
  customBudget: string;
  availability: DishAvailability;
};

type SearchSuggestion =
  | { key: string; type: "restaurant"; label: string; restaurant: Restaurant }
  | { key: string; type: "dish"; label: string; restaurant: Restaurant; dish: Dish }
  | { key: string; type: "term"; label: string };

const TYPE_OPTIONS: Array<{
  key: ResultType;
  label: string;
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
}> = [
  { key: "all", label: "Todos", iconName: "silverware-fork-knife" },
  { key: "restaurants", label: "Restaurantes", iconName: "storefront-outline" },
  { key: "dishes", label: "Platos", iconName: "food-outline" },
];

const DEFAULT_ADVANCED_FILTERS: AdvancedFilters = {
  budgetPreset: "none",
  customBudget: "",
  availability: "all",
};

function getDishPriceValue(dish: Dish) {
  const value = Number(dish.price.replace(",", "."));
  return Number.isFinite(value) ? value : null;
}

function getBudgetValue(filters: AdvancedFilters) {
  if (filters.budgetPreset === "none") return null;
  if (filters.budgetPreset === "custom") {
    const value = Number(filters.customBudget.replace(",", "."));
    return Number.isFinite(value) && value > 0 ? value : null;
  }
  return Number(filters.budgetPreset);
}

function hasAdvancedFilters(filters: AdvancedFilters) {
  return (
    filters.budgetPreset !== "none" ||
    filters.availability !== "all"
  );
}

function getAdvancedFilterCount(filters: AdvancedFilters) {
  return [
    filters.budgetPreset !== "none",
    filters.availability !== "all",
  ].filter(Boolean).length;
}

function getBudgetLabel(filters: AdvancedFilters) {
  if (filters.budgetPreset === "none") return null;
  if (filters.budgetPreset === "custom") {
    const value = getBudgetValue(filters);
    return value ? `Presupuesto: hasta $${value}` : "Presupuesto personalizado";
  }
  return `Presupuesto: hasta $${filters.budgetPreset}`;
}

function getSortLabel(sort: SortMode) {
  if (sort === "priceAsc") return "Precio menor";
  if (sort === "priceDesc") return "Precio mayor";
  if (sort === "nameAsc") return "Nombre A-Z";
  return "Relevancia";
}

function getResultsSummary(restaurantCount: number, dishCount: number) {
  if (restaurantCount > 0 && dishCount > 0) {
    return `${restaurantCount} ${restaurantCount === 1 ? "restaurante" : "restaurantes"} · ${dishCount} ${dishCount === 1 ? "plato" : "platos"}`;
  }
  if (restaurantCount > 0) return `${restaurantCount} ${restaurantCount === 1 ? "restaurante" : "restaurantes"}`;
  if (dishCount > 0) return `${dishCount} ${dishCount === 1 ? "plato" : "platos"}`;
  return "0 resultados";
}

function getRestaurantTimeLabel(restaurant: Restaurant) {
  if (restaurant.openingTime && restaurant.closingTime) {
    return `${restaurant.openingTime.slice(0, 5)} - ${restaurant.closingTime.slice(0, 5)}`;
  }
  return null;
}

function getRestaurantSummary(restaurant: Restaurant, dishCount = 0) {
  if (dishCount > 0) return `${dishCount} ${dishCount === 1 ? "plato" : "platos"}`;
  if (restaurant.location) return restaurant.location;
  const timeLabel = getRestaurantTimeLabel(restaurant);
  if (timeLabel) return timeLabel;
  return restaurant.description || null;
}

function matchesQuery(value: string | undefined, query: string) {
  return Boolean(value?.toLowerCase().includes(query));
}

function normalizeDisplayWord(value?: string | null) {
  const raw = value?.trim();
  if (!raw) return "";

  if (/^[A-ZÁÉÍÓÚÜÑ]{2,}$/.test(raw) && raw.length <= 4) {
    return raw;
  }

  return raw
    .toLocaleLowerCase("es-EC")
    .replace(/(^|['’ -])([\p{L}])/gu, (_match, separator: string, letter: string) =>
      `${separator}${letter.toLocaleUpperCase("es-EC")}`
    );
}

function formatNaturalName(value?: string | null) {
  const raw = value?.trim();
  if (!raw) return "";

  return raw
    .split(/\s+/)
    .map((part) => {
      if (/\p{Ll}/u.test(part) && /\p{Lu}/u.test(part)) return part;
      if (/^[A-ZÁÉÍÓÚÜÑ0-9&.-]{2,}$/.test(part) && /[A-ZÁÉÍÓÚÜÑ]/.test(part)) {
        return part.length <= 4 ? part : normalizeDisplayWord(part);
      }
      return normalizeDisplayWord(part);
    })
    .join(" ");
}

function getRatingData(source: unknown) {
  if (typeof source !== "object" || source === null) return null;
  const record = source as Record<string, unknown>;
  const rawRating =
    record.average_rating ??
    record.averageRating ??
    record.rating;
  const rawCount =
    record.ratings_count ??
    record.ratingsCount ??
    record.reviews_count ??
    record.reviewsCount;
  const rating = typeof rawRating === "number" ? rawRating : Number(rawRating);
  const count = typeof rawCount === "number" ? rawCount : Number(rawCount);

  if (!Number.isFinite(rating) || rating <= 0) return null;
  if (!Number.isFinite(count) || count <= 0) return null;

  return {
    rating: Math.min(5, Math.max(0, rating)),
    count: Math.floor(count),
  };
}

export function ExploreScreen({
  bottomInset,
  onOpenRestaurant,
}: ExploreScreenProps) {
  const theme = useThemeColors();
  const { restaurants, loading, error, reload } = useRestaurants();
  const [dishResults, setDishResults] = useState<ExploreResult[]>([]);
  const [dishLoading, setDishLoading] = useState(false);
  const [dishError, setDishError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [resultType, setResultType] = useState<ResultType>("all");
  const [openOnly, setOpenOnly] = useState(false);
  const [filters, setFilters] = useState<AdvancedFilters>(DEFAULT_ADVANCED_FILTERS);
  const [draftFilters, setDraftFilters] = useState<AdvancedFilters>(DEFAULT_ADVANCED_FILTERS);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [sort, setSort] = useState<SortMode>("relevance");
  const [sortModalVisible, setSortModalVisible] = useState(false);

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
          return dishes.map((dish, index) => ({
            key: `${restaurant.id}-${dish.id}`,
            restaurant,
            dish,
            originalIndex: index,
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

  const restaurantDishCounts = useMemo(() => {
    const counts = new Map<string, number>();
    dishResults.forEach((result) => {
      const key = String(result.restaurant.id);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return counts;
  }, [dishResults]);

  const normalizedQuery = query.trim().toLowerCase();
  const budgetValue = getBudgetValue(filters);

  const filteredDishes = useMemo(() => {
    let next = dishResults.filter(({ dish, restaurant }) => {
      const price = getDishPriceValue(dish);
      const queryMatch =
        !normalizedQuery ||
        matchesQuery(dish.name, normalizedQuery) ||
        matchesQuery(dish.description, normalizedQuery) ||
        matchesQuery(dish.category, normalizedQuery) ||
        matchesQuery(restaurant.name, normalizedQuery);
      const openMatch = !openOnly || restaurant.isActive;
      const availabilityMatch =
        filters.availability === "all" || (dish.isActive && dish.isAvailable);
      const budgetMatch =
        budgetValue === null || (price !== null && price <= budgetValue);

      return queryMatch && openMatch && availabilityMatch && budgetMatch;
    });

    if (sort === "priceAsc") {
      next = [...next].sort(
        (left, right) =>
          (getDishPriceValue(left.dish) ?? Number.POSITIVE_INFINITY) -
          (getDishPriceValue(right.dish) ?? Number.POSITIVE_INFINITY)
      );
    } else if (sort === "priceDesc") {
      next = [...next].sort(
        (left, right) =>
          (getDishPriceValue(right.dish) ?? Number.NEGATIVE_INFINITY) -
          (getDishPriceValue(left.dish) ?? Number.NEGATIVE_INFINITY)
      );
    } else if (sort === "nameAsc") {
      next = [...next].sort((left, right) =>
        left.dish.name.localeCompare(right.dish.name)
      );
    } else {
      next = [...next].sort((left, right) => {
        const imageRank = Number(Boolean(right.dish.imageUrl)) - Number(Boolean(left.dish.imageUrl));
        if (imageRank !== 0) return imageRank;
        return left.originalIndex - right.originalIndex;
      });
    }

    return next;
  }, [budgetValue, dishResults, filters.availability, normalizedQuery, openOnly, sort]);

  const filteredRestaurants = useMemo(() => {
    let next = restaurants.filter((restaurant) => {
      const queryMatch =
        !normalizedQuery ||
        matchesQuery(restaurant.name, normalizedQuery) ||
        matchesQuery(restaurant.location, normalizedQuery) ||
        matchesQuery(restaurant.description, normalizedQuery);
      return queryMatch && (!openOnly || restaurant.isActive);
    });

    if (sort === "nameAsc") {
      next = [...next].sort((left, right) =>
        left.name.localeCompare(right.name)
      );
    } else if (normalizedQuery) {
      next = [...next].sort((left, right) => {
        const leftStarts = left.name.toLowerCase().startsWith(normalizedQuery) ? 0 : 1;
        const rightStarts = right.name.toLowerCase().startsWith(normalizedQuery) ? 0 : 1;
        return leftStarts - rightStarts;
      });
    }

    return next;
  }, [normalizedQuery, openOnly, restaurants, sort]);

  const visibleRestaurants =
    resultType === "dishes" ? [] : filteredRestaurants;
  const visibleDishes =
    resultType === "restaurants" ? [] : filteredDishes;

  const suggestions = useMemo<SearchSuggestion[]>(() => {
    if (!normalizedQuery) return [];

    const restaurantSuggestions = restaurants
      .filter((restaurant) => matchesQuery(restaurant.name, normalizedQuery))
      .slice(0, 3)
      .map((restaurant) => ({
        key: `restaurant-${restaurant.id}`,
        type: "restaurant" as const,
        label: restaurant.name,
        restaurant,
      }));

    const dishSuggestions = dishResults
      .filter(({ dish }) => matchesQuery(dish.name, normalizedQuery))
      .slice(0, 3)
      .map(({ dish, restaurant }) => ({
        key: `dish-${restaurant.id}-${dish.id}`,
        type: "dish" as const,
        label: dish.name,
        dish,
        restaurant,
      }));

    const termSuggestions = Array.from(
      new Set(
        dishResults
          .flatMap(({ dish }) => [dish.category, dish.description])
          .filter((value): value is string => Boolean(value))
          .filter((value) => matchesQuery(value, normalizedQuery))
          .map((value) => value.trim())
      )
    )
      .slice(0, 1)
      .map((label) => ({
        key: `term-${label}`,
        type: "term" as const,
        label,
      }));

    return [...restaurantSuggestions, ...dishSuggestions, ...termSuggestions].slice(0, 7);
  }, [dishResults, normalizedQuery, restaurants]);

  const isInitialLoading = (loading || dishLoading) && dishResults.length === 0;
  const resolvedError = error ?? dishError;
  const hasResults = visibleRestaurants.length > 0 || visibleDishes.length > 0;
  const advancedFilterCount = getAdvancedFilterCount(filters);
  const resultsSummary = getResultsSummary(visibleRestaurants.length, visibleDishes.length);

  const openFilters = () => {
    setDraftFilters(filters);
    setFilterModalVisible(true);
  };

  const closeFilters = () => {
    setDraftFilters(filters);
    setFilterModalVisible(false);
  };

  const applyFilters = () => {
    setFilters(draftFilters);
    setFilterModalVisible(false);
  };

  const clearAllFilters = () => {
    setFilters(DEFAULT_ADVANCED_FILTERS);
    setDraftFilters(DEFAULT_ADVANCED_FILTERS);
    setOpenOnly(false);
    setResultType("all");
    setSort("relevance");
    setQuery("");
  };

  const clearAdvancedFilter = (key: keyof AdvancedFilters) => {
    setFilters((current) => ({
      ...current,
      [key]: DEFAULT_ADVANCED_FILTERS[key],
      ...(key === "budgetPreset" ? { customBudget: "" } : {}),
    }));
  };

  const openSuggestion = (suggestion: SearchSuggestion) => {
    if (suggestion.type === "restaurant") {
      Keyboard.dismiss();
      onOpenRestaurant(suggestion.restaurant);
      return;
    }

    if (suggestion.type === "dish") {
      Keyboard.dismiss();
      onOpenRestaurant(suggestion.restaurant, suggestion.dish);
      return;
    }

    setQuery(suggestion.label);
  };

  return (
    <ScreenContainer bottomInset={bottomInset} contentStyle={styles.explore}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.exploreContent,
          { paddingBottom: bottomInset + spacing.lg },
        ]}
      >
        <ExploreHeader />

        <EntranceGroup delay={35}>
          <ExploreSearchBar
            advancedFilterCount={advancedFilterCount}
            query={query}
            suggestions={isSearchFocused ? suggestions : []}
            onChangeQuery={setQuery}
            onClear={() => setQuery("")}
            onFocus={() => setIsSearchFocused(true)}
            onOpenFilters={openFilters}
            onSelectSuggestion={openSuggestion}
          />
        </EntranceGroup>

        <EntranceGroup delay={80}>
          <ExploreTypeSelector value={resultType} onChange={setResultType} />
        </EntranceGroup>

        <ExploreDiscoveryControls
          openOnly={openOnly}
          resultsLabel={resultsSummary}
          sortLabel={getSortLabel(sort)}
          onPressOpenOnly={() => setOpenOnly((current) => !current)}
          onPressSort={() => setSortModalVisible(true)}
        />

        {hasAdvancedFilters(filters) ? (
          <ExploreActiveFilters
            filters={filters}
            onClearAll={() => setFilters(DEFAULT_ADVANCED_FILTERS)}
            onClearFilter={clearAdvancedFilter}
          />
        ) : null}

        {isInitialLoading ? (
          <ExploreLoadingSkeleton />
        ) : resolvedError ? (
          <ErrorState
            title="No se pudieron cargar los resultados"
            message={resolvedError}
            onRetry={() => {
              void reload().then(loadDishes);
            }}
            style={styles.feedbackState}
          />
        ) : !hasResults ? (
          <EmptyState
            title="No encontramos resultados"
            message={
              query.trim()
                ? `No encontramos resultados para "${query.trim()}".`
                : "Prueba con otra búsqueda o limpia los filtros."
            }
            iconName="food-off-outline"
            actionLabel="Limpiar filtros"
            onActionPress={clearAllFilters}
            style={styles.feedbackState}
          />
        ) : (
          <>
            {visibleRestaurants.length > 0 ? (
              <View style={styles.exploreSection}>
                <ExploreSectionHeader title="Restaurantes" />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.restaurantCarousel}
                >
                  {visibleRestaurants.map((restaurant, index) => (
                    <ExploreRestaurantCard
                      key={`restaurant-${restaurant.id}`}
                      index={index}
                      restaurant={restaurant}
                      dishCount={restaurantDishCounts.get(String(restaurant.id)) ?? 0}
                      onPress={() => onOpenRestaurant(restaurant)}
                    />
                  ))}
                </ScrollView>
              </View>
            ) : null}

            {visibleDishes.length > 0 ? (
              <View style={styles.exploreSection}>
                <ExploreSectionHeader title="Platos para ti" />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.dishCarousel}
                >
                  {visibleDishes.map((item, index) => (
                    <ExploreDishCard
                      key={item.key}
                      result={item}
                      index={index}
                      onOpenDish={(restaurant, dish) =>
                        onOpenRestaurant(restaurant, dish)
                      }
                    />
                  ))}
                </ScrollView>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>

      <ExploreFiltersModal
        draftFilters={draftFilters}
        resultType={resultType}
        visible={filterModalVisible}
        onApply={applyFilters}
        onChangeDraft={setDraftFilters}
        onClear={() => setDraftFilters(DEFAULT_ADVANCED_FILTERS)}
        onClose={closeFilters}
      />
      <ExploreSortModal
        selected={sort}
        visible={sortModalVisible}
        onClose={() => setSortModalVisible(false)}
        onSelect={(nextSort) => {
          setSort(nextSort);
          setSortModalVisible(false);
        }}
      />
    </ScreenContainer>
  );
}

function ExploreHeader() {
  const theme = useThemeColors();
  const reduceMotion = useReduceMotion();
  const opacity = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(reduceMotion ? 0 : 8)).current;

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, reduceMotion, translateY]);

  return (
    <Animated.View style={[styles.exploreHeader, { opacity, transform: [{ translateY }] }]}>
      <Text style={[styles.exploreTitle, { color: theme.textPrimary }]}>
        Explorar
      </Text>
      <Text style={[styles.exploreSubtitle, { color: theme.textSecondary }]}>
        Encuentra sabores dentro del campus
      </Text>
    </Animated.View>
  );
}

function EntranceGroup({
  children,
  delay,
}: {
  children: React.ReactNode;
  delay: number;
}) {
  const reduceMotion = useReduceMotion();
  const opacity = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(reduceMotion ? 0 : 7)).current;

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 230,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 230,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacity, reduceMotion, translateY]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

function ExploreSearchBar({
  advancedFilterCount,
  onChangeQuery,
  onClear,
  onFocus,
  onOpenFilters,
  onSelectSuggestion,
  query,
  suggestions,
}: {
  advancedFilterCount: number;
  onChangeQuery: (value: string) => void;
  onClear: () => void;
  onFocus: () => void;
  onOpenFilters: () => void;
  onSelectSuggestion: (suggestion: SearchSuggestion) => void;
  query: string;
  suggestions: SearchSuggestion[];
}) {
  const theme = useThemeColors();

  return (
    <View style={styles.searchBlock}>
      <View style={styles.searchRow}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: theme.surfaceElevated, borderColor: theme.primarySoft },
          ]}
        >
          <MaterialCommunityIcons name="magnify" size={20} color={theme.primary} />
          <TextInput
            value={query}
            onChangeText={onChangeQuery}
            onFocus={onFocus}
            placeholder="Buscar platos o restaurantes"
            placeholderTextColor={theme.textSecondary}
            accessibilityLabel="Buscar platos o restaurantes"
            style={[styles.searchInput, { color: theme.textPrimary }]}
          />
          {query ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Limpiar búsqueda"
              onPress={onClear}
              style={styles.searchClearButton}
            >
              <MaterialCommunityIcons name="close" size={18} color={theme.textMuted} />
            </Pressable>
          ) : null}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Abrir filtros avanzados${advancedFilterCount ? `, ${advancedFilterCount} activos` : ""}`}
          onPress={onOpenFilters}
          style={({ pressed }) => [
            styles.searchFilterButton,
            {
              backgroundColor: theme.primaryFaint,
              borderColor: theme.primarySoft,
            },
            pressed && styles.pressed,
          ]}
        >
          <MaterialCommunityIcons
            name="tune-variant"
            size={22}
            color={theme.primary}
          />
          {advancedFilterCount ? (
            <View style={[styles.filterBadge, { backgroundColor: theme.primary }]}>
              <Text style={[styles.filterBadgeText, { color: theme.textInverted }]}>
                {advancedFilterCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      {suggestions.length > 0 ? (
        <View
          style={[
            styles.suggestionsPanel,
            { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
          ]}
        >
          {suggestions.map((suggestion) => (
            <SearchSuggestionRow
              key={suggestion.key}
              suggestion={suggestion}
              onPress={() => onSelectSuggestion(suggestion)}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function SearchSuggestionRow({
  onPress,
  suggestion,
}: {
  onPress: () => void;
  suggestion: SearchSuggestion;
}) {
  const theme = useThemeColors();
  const iconName =
    suggestion.type === "restaurant"
      ? "storefront-outline"
      : suggestion.type === "dish"
        ? "food-outline"
        : "tag-outline";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={suggestion.label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.suggestionRow,
        pressed && { backgroundColor: theme.primaryFaint },
      ]}
    >
      <View style={[styles.suggestionThumb, { backgroundColor: theme.surfaceSecondary }]}>
        {suggestion.type === "restaurant" ? (
          <FadeInImage
            source={getRestaurantImageSource(suggestion.restaurant)}
            style={styles.resultImage}
          />
        ) : suggestion.type === "dish" ? (
          <FadeInImage
            source={getDishImageSource(suggestion.dish, suggestion.restaurant)}
            style={styles.resultImage}
          />
        ) : (
          <MaterialCommunityIcons
            name={iconName}
            size={18}
            color={theme.primary}
          />
        )}
      </View>
      <View style={styles.suggestionText}>
        <Text style={[styles.suggestionTitle, { color: theme.textPrimary }]} numberOfLines={1}>
          {suggestion.label}
        </Text>
        <Text style={[styles.suggestionMeta, { color: theme.textSecondary }]} numberOfLines={1}>
          {suggestion.type === "restaurant"
            ? "Restaurante"
            : suggestion.type === "dish"
              ? "Plato"
              : "Sugerencia"}
        </Text>
      </View>
    </Pressable>
  );
}

function ExploreTypeSelector({
  onChange,
  value,
}: {
  onChange: (value: ResultType) => void;
  value: ResultType;
}) {
  const theme = useThemeColors();
  const reduceMotion = useReduceMotion();
  const [selectorWidth, setSelectorWidth] = useState(0);
  const activeIndex = TYPE_OPTIONS.findIndex((option) => option.key === value);
  const indicatorProgress = useRef(new Animated.Value(Math.max(activeIndex, 0))).current;
  const indicatorWidth = selectorWidth > 0 ? (selectorWidth - 6) / TYPE_OPTIONS.length : 0;

  useEffect(() => {
    if (reduceMotion) {
      indicatorProgress.setValue(Math.max(activeIndex, 0));
      return;
    }

    Animated.timing(indicatorProgress, {
      toValue: Math.max(activeIndex, 0),
      duration: 210,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [activeIndex, indicatorProgress, reduceMotion]);

  return (
    <View
      style={[
        styles.typeSelector,
        { backgroundColor: theme.primaryFaint, borderColor: theme.primarySoft },
      ]}
      onLayout={(event) => setSelectorWidth(event.nativeEvent.layout.width)}
    >
      {indicatorWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.typeActiveIndicator,
            {
              width: indicatorWidth,
              backgroundColor: "rgba(214, 112, 39, 0.9)",
              transform: [
                {
                  translateX: indicatorProgress.interpolate({
                    inputRange: [0, 1, 2],
                    outputRange: [0, indicatorWidth, indicatorWidth * 2],
                  }),
                },
              ],
            },
          ]}
        />
      ) : null}
      {TYPE_OPTIONS.map((option) => {
        const selected = value === option.key;
        return (
          <Pressable
            key={option.key}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            onPress={() => onChange(option.key)}
            style={({ pressed }) => [
              styles.typeOption,
              pressed && styles.pressed,
            ]}
          >
            <MaterialCommunityIcons
              name={option.iconName}
              size={14}
              color={selected ? theme.textInverted : theme.primary}
            />
            <Text
              style={[
                styles.typeOptionText,
                { color: selected ? theme.textInverted : theme.textPrimary },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ExploreDiscoveryControls({
  onPressOpenOnly,
  onPressSort,
  openOnly,
  resultsLabel,
  sortLabel,
}: {
  onPressOpenOnly: () => void;
  onPressSort: () => void;
  openOnly: boolean;
  resultsLabel: string;
  sortLabel: string;
}) {
  return (
    <View style={styles.discoveryControls}>
      <ExploreQuickFilter
        selected={openOnly}
        onPress={onPressOpenOnly}
      />
      <ExploreResultsSummary
        label={resultsLabel}
        sortLabel={sortLabel}
        onPressSort={onPressSort}
      />
    </View>
  );
}

function ExploreQuickFilter({
  onPress,
  selected,
}: {
  onPress: () => void;
  selected: boolean;
}) {
  const theme = useThemeColors();

  return (
    <View style={styles.quickFilterRow}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel="Filtrar abiertos"
        onPress={onPress}
        style={({ pressed }) => [
          styles.quickFilterChip,
          {
            backgroundColor: selected ? theme.primaryFaint : theme.surfaceElevated,
            borderColor: selected ? theme.primarySoft : theme.border,
          },
          pressed && styles.pressed,
        ]}
      >
        {selected ? (
          <View style={[styles.statusDot, { backgroundColor: theme.success }]} />
        ) : null}
        <Text style={[styles.quickFilterText, { color: selected ? theme.primary : theme.textPrimary }]}>
          Abiertos
        </Text>
        {selected ? <MaterialCommunityIcons name="check" size={15} color={theme.primary} /> : null}
      </Pressable>
    </View>
  );
}

function ExploreActiveFilters({
  filters,
  onClearAll,
  onClearFilter,
}: {
  filters: AdvancedFilters;
  onClearAll: () => void;
  onClearFilter: (key: keyof AdvancedFilters) => void;
}) {
  const theme = useThemeColors();
  const reduceMotion = useReduceMotion();
  const opacity = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const scale = useRef(new Animated.Value(reduceMotion ? 1 : 0.98)).current;
  const budgetLabel = getBudgetLabel(filters);
  const chips: Array<{ key: keyof AdvancedFilters; label: string }> = [];

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1);
      scale.setValue(1);
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, reduceMotion, scale]);

  if (budgetLabel) {
    chips.push({ key: "budgetPreset", label: budgetLabel });
  }

  if (filters.availability !== "all") {
    chips.push({ key: "availability", label: "Disponibles" });
  }

  if (chips.length === 0) return null;

  return (
    <Animated.View style={[styles.activeFiltersWrap, { opacity, transform: [{ scale }] }]}>
      {chips.map((chip) => (
        <Pressable
          key={chip.key}
          accessibilityRole="button"
          accessibilityLabel={`Quitar ${chip.label}`}
          onPress={() => onClearFilter(chip.key)}
          style={({ pressed }) => [
            styles.activeFilterChip,
            { backgroundColor: theme.primaryFaint, borderColor: theme.primarySoft },
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.activeFilterText, { color: theme.primary }]} numberOfLines={1}>
            {chip.label}
          </Text>
          <MaterialCommunityIcons name="close" size={14} color={theme.primary} />
        </Pressable>
      ))}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Limpiar filtros avanzados"
        onPress={onClearAll}
        style={styles.activeFilterClear}
      >
        <Text style={[styles.activeFilterClearText, { color: theme.primary }]}>
          Limpiar
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function ExploreResultsSummary({
  label,
  onPressSort,
  sortLabel,
}: {
  label: string;
  onPressSort: () => void;
  sortLabel: string;
}) {
  const theme = useThemeColors();

  return (
    <View style={styles.resultsSummaryRow}>
      <Text style={[styles.resultsSummaryText, { color: theme.textSecondary }]}>
        {label}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ordenar: ${sortLabel}`}
        onPress={onPressSort}
        style={({ pressed }) => [
          styles.sortButton,
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.sortButtonText, { color: theme.textSecondary }]} numberOfLines={1}>
          {sortLabel}
        </Text>
        <MaterialCommunityIcons name="chevron-down" size={15} color={theme.primary} />
      </Pressable>
    </View>
  );
}

function ExploreSortModal({
  onClose,
  onSelect,
  selected,
  visible,
}: {
  onClose: () => void;
  onSelect: (sort: SortMode) => void;
  selected: SortMode;
  visible: boolean;
}) {
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.sortModalBackdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={[
            styles.sortModalSheet,
            {
              backgroundColor: theme.surfaceElevated,
              borderColor: theme.border,
              paddingBottom: Math.max(insets.bottom, spacing.xs),
            },
          ]}
        >
          <View style={styles.sortModalHeader}>
            <Text style={[styles.sortModalTitle, { color: theme.textPrimary }]}>
              Ordenar
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar ordenamiento"
              onPress={onClose}
              style={({ pressed }) => [
                styles.sortModalClose,
                { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
                pressed && styles.pressed,
              ]}
            >
              <MaterialCommunityIcons name="close" size={18} color={theme.textSecondary} />
            </Pressable>
          </View>
          <View style={styles.sortOptions}>
            {[
              { key: "relevance" as const, label: "Relevancia" },
              { key: "priceAsc" as const, label: "Precio menor" },
              { key: "priceDesc" as const, label: "Precio mayor" },
              { key: "nameAsc" as const, label: "Nombre A-Z" },
            ].map((item) => (
              <FilterModalOption
                key={item.key}
                label={item.label}
                selected={selected === item.key}
                onPress={() => onSelect(item.key)}
              />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ExploreFiltersModal({
  draftFilters,
  onApply,
  onChangeDraft,
  onClear,
  onClose,
  resultType,
  visible,
}: {
  draftFilters: AdvancedFilters;
  onApply: () => void;
  onChangeDraft: (filters: AdvancedFilters) => void;
  onClear: () => void;
  onClose: () => void;
  resultType: ResultType;
  visible: boolean;
}) {
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();
  const customBudgetInvalid =
    draftFilters.budgetPreset === "custom" &&
    draftFilters.customBudget.trim().length > 0 &&
    getBudgetValue(draftFilters) === null;

  const updateDraft = (next: Partial<AdvancedFilters>) => {
    onChangeDraft({ ...draftFilters, ...next });
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.filterModalBackdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={[
            styles.filterModalSheet,
            {
              backgroundColor: theme.surfaceElevated,
              borderColor: theme.border,
              paddingBottom: Math.max(insets.bottom, spacing.xs),
            },
          ]}
        >
          <View style={styles.filterModalHeader}>
            <Text style={[styles.filterModalTitle, { color: theme.textPrimary }]}>
              Filtros
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar filtros"
              onPress={onClose}
              style={({ pressed }) => [
                styles.filterModalIconButton,
                { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
                pressed && styles.pressed,
              ]}
            >
              <MaterialCommunityIcons name="close" size={20} color={theme.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.filterModalOptions}>
            <FilterModalSection title="Presupuesto máximo">
              {[
                { key: "none" as const, label: "Sin límite" },
                { key: "2" as const, label: "Hasta $2" },
                { key: "3" as const, label: "Hasta $3" },
                { key: "5" as const, label: "Hasta $5" },
                { key: "custom" as const, label: "Personalizado" },
              ].map((item) => (
                <FilterModalOption
                  key={item.key}
                  label={item.label}
                  selected={draftFilters.budgetPreset === item.key}
                  onPress={() => updateDraft({ budgetPreset: item.key })}
                />
              ))}
              {draftFilters.budgetPreset === "custom" ? (
                <View
                  style={[
                    styles.customBudgetField,
                    {
                      backgroundColor: theme.surfaceSecondary,
                      borderColor: customBudgetInvalid ? theme.danger : theme.border,
                    },
                  ]}
                >
                  <Text style={[styles.budgetPrefix, { color: theme.primary }]}>$</Text>
                  <TextInput
                    value={draftFilters.customBudget}
                    onChangeText={(value) => updateDraft({ customBudget: value })}
                    keyboardType="decimal-pad"
                    accessibilityLabel="Presupuesto personalizado"
                    placeholder="0.00"
                    placeholderTextColor={theme.textMuted}
                    style={[styles.customBudgetInput, { color: theme.textPrimary }]}
                  />
                </View>
              ) : null}
              {customBudgetInvalid ? (
                <Text style={[styles.filterHint, { color: theme.danger }]}>
                  Ingresa un valor mayor que 0.
                </Text>
              ) : null}
            </FilterModalSection>

            {resultType !== "restaurants" ? (
              <FilterModalSection title="Disponibilidad de platos">
                {[
                  { key: "all" as const, label: "Todos" },
                  { key: "available" as const, label: "Solo disponibles" },
                ].map((item) => (
                  <FilterModalOption
                    key={item.key}
                    label={item.label}
                    selected={draftFilters.availability === item.key}
                    onPress={() => updateDraft({ availability: item.key })}
                  />
                ))}
              </FilterModalSection>
            ) : (
              <Text style={[styles.filterHint, { color: theme.textSecondary }]}>
                La disponibilidad de platos no se aplica al ver solo restaurantes.
              </Text>
            )}

          </View>

          <View style={styles.filterModalActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Limpiar filtros"
              onPress={onClear}
              style={({ pressed }) => [
                styles.filterModalSecondaryAction,
                { borderColor: theme.border },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.filterModalActionText, { color: theme.primary }]}>
                Limpiar
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Aplicar filtros"
              disabled={customBudgetInvalid}
              onPress={onApply}
              style={({ pressed }) => [
                styles.filterModalApply,
                { backgroundColor: theme.primary },
                customBudgetInvalid && styles.disabled,
                pressed && !customBudgetInvalid && styles.pressed,
              ]}
            >
              <Text style={[styles.filterModalApplyText, { color: theme.textInverted }]}>
                Aplicar
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function FilterModalSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  const theme = useThemeColors();

  return (
    <View style={styles.filterModalSection}>
      <Text style={[styles.filterModalSectionTitle, { color: theme.textSecondary }]}>
        {title}
      </Text>
      <View style={styles.filterModalOptionGroup}>{children}</View>
    </View>
  );
}

function FilterModalOption({
  label,
  onPress,
  selected,
}: {
  label: string;
  onPress: () => void;
  selected: boolean;
}) {
  const theme = useThemeColors();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterModalOption,
        {
          backgroundColor: selected ? theme.primaryFaint : theme.surfaceSecondary,
          borderColor: selected ? theme.primarySoft : theme.border,
        },
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.filterModalOptionText,
          { color: selected ? theme.primary : theme.textPrimary },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
      {selected ? (
        <MaterialCommunityIcons name="check" size={16} color={theme.primary} />
      ) : null}
    </Pressable>
  );
}

function ExploreSectionHeader({ title }: { title: string }) {
  const theme = useThemeColors();

  return (
    <View style={styles.exploreSectionHeader}>
      <Text style={[styles.exploreSectionTitle, { color: theme.textPrimary }]}>
        {title}
      </Text>
    </View>
  );
}

function ExploreLoadingSkeleton() {
  const theme = useThemeColors();

  return (
    <View style={styles.feedbackStack}>
      <ExploreSectionHeader title="Restaurantes" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.restaurantCarousel}
      >
        {[0, 1, 2].map((item) => (
          <View
            key={`restaurant-skeleton-${item}`}
            style={[
              styles.restaurantCard,
              { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
            ]}
          >
            <View style={[styles.resultImage, { backgroundColor: theme.surfaceSecondary }]} />
            <View style={styles.restaurantCardCopy}>
              <View style={[styles.skeletonLineLarge, { backgroundColor: "rgba(255, 255, 255, 0.78)" }]} />
              <View style={[styles.skeletonLine, { backgroundColor: "rgba(255, 255, 255, 0.6)" }]} />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function ExploreRestaurantCard({
  dishCount,
  index,
  onPress,
  restaurant,
}: {
  dishCount: number;
  index: number;
  onPress: () => void;
  restaurant: Restaurant;
}) {
  const theme = useThemeColors();
  const { isRestaurantFavorite, toggleRestaurant } = useFavorites();
  const favorite = isRestaurantFavorite(restaurant.id);
  const summary = getRestaurantSummary(restaurant, dishCount);
  const ratingData = getRatingData(restaurant);
  const reduceMotion = useReduceMotion();
  const shouldAnimate = !reduceMotion && index < 5;
  const opacity = useRef(new Animated.Value(shouldAnimate ? 0 : 1)).current;
  const translateY = useRef(new Animated.Value(shouldAnimate ? 8 : 0)).current;

  useEffect(() => {
    if (!shouldAnimate) {
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: designSystem.animation.normal,
        delay: Math.min(index * 35, 140),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: designSystem.animation.normal,
        delay: Math.min(index * 35, 140),
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, opacity, shouldAnimate, translateY]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver restaurante ${restaurant.name}`}
        onPress={onPress}
        style={({ pressed }) => [
          styles.restaurantCard,
          { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
          pressed && styles.pressed,
        ]}
      >
        <FadeInImage
          source={getRestaurantImageSource(restaurant)}
          style={styles.restaurantCardImage}
        />
        <View pointerEvents="none" style={styles.restaurantGradientSoft} />
        <View pointerEvents="none" style={styles.restaurantGradientDeep} />
        <View style={styles.restaurantTopRow}>
          <StatusPill active={restaurant.isActive} />
          <FavoriteScaleButton
            favorite={favorite}
            onPress={() => toggleRestaurant(restaurant)}
          />
        </View>
        <View style={styles.restaurantCardCopy}>
          <OptionalRating data={ratingData} />
          <Text
            style={styles.restaurantCardTitle}
            numberOfLines={2}
          >
            {formatNaturalName(restaurant.name)}
          </Text>
          {summary ? (
            <Text
              style={styles.restaurantCardMeta}
              numberOfLines={1}
            >
              {formatNaturalName(summary)}
            </Text>
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

function ExploreDishCard({
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
  const { dish, restaurant } = result;
  const { isDishFavorite, toggleDish } = useFavorites();
  const favorite = isDishFavorite(dish.id);
  const ratingData = getRatingData(dish);
  const shouldAnimate = !reduceMotion && index < 6;
  const opacity = useRef(new Animated.Value(shouldAnimate ? 0 : 1)).current;
  const translateY = useRef(new Animated.Value(shouldAnimate ? 8 : 0)).current;

  useEffect(() => {
    if (!shouldAnimate) {
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: designSystem.animation.normal,
        delay: Math.min(index * 35, 140),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: designSystem.animation.normal,
        delay: Math.min(index * 35, 140),
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, opacity, shouldAnimate, translateY]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver ${dish.name}`}
        onPress={() => onOpenDish(restaurant, dish)}
        style={({ pressed }) => [
          styles.exploreDishCard,
          { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.exploreDishMedia}>
          <FadeInImage
            source={getDishImageSource(dish, restaurant)}
            style={styles.resultImage}
          />
          <View style={styles.dishImageShade} />
          <FavoriteScaleButton
            favorite={favorite}
            style={styles.exploreDishFavorite}
            onPress={() => toggleDish(restaurant, dish)}
          />
        </View>
        <View style={styles.exploreDishBody}>
          <OptionalRating data={ratingData} variant="light" />
          <Text
            style={[styles.resultName, { color: theme.textPrimary }]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {formatNaturalName(dish.name)}
          </Text>
          <Text
            style={[styles.resultRestaurant, { color: theme.textSecondary }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {formatNaturalName(restaurant.name)}
          </Text>
          <Text
            style={[styles.resultPrice, styles.exploreDishPrice, { color: theme.primary }]}
            numberOfLines={1}
          >
            ${dish.price}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function FadeInImage({
  source,
  style,
}: {
  source: ImageSourcePropType;
  style: StyleProp<ImageStyle>;
}) {
  const reduceMotion = useReduceMotion();
  const opacity = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;

  const handleLoad = () => {
    if (reduceMotion) {
      opacity.setValue(1);
      return;
    }

    Animated.timing(opacity, {
      toValue: 1,
      duration: designSystem.animation.fast,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.Image
      source={source}
      style={[style, { opacity }]}
      resizeMode="cover"
      onLoad={handleLoad}
    />
  );
}

function FavoriteScaleButton({
  favorite,
  onPress,
  style,
}: {
  favorite: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useThemeColors();
  const reduceMotion = useReduceMotion();
  const scale = useRef(new Animated.Value(1)).current;

  const animatePress = () => {
    if (reduceMotion) return;

    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.94,
        duration: 65,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1.05,
        duration: 85,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 95,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={favorite ? "Quitar favorito" : "Guardar favorito"}
        onPress={(event) => {
          event.stopPropagation();
          animatePress();
          void triggerFeedback("selection");
          onPress();
        }}
        style={({ pressed }) => [
          styles.favoriteButton,
          { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
          pressed && styles.pressed,
        ]}
      >
        <MaterialCommunityIcons
          name={favorite ? "heart" : "heart-outline"}
          size={20}
          color={theme.primary}
        />
      </Pressable>
    </Animated.View>
  );
}

function StatusPill({ active }: { active: boolean }) {
  const theme = useThemeColors();

  return (
    <View
      style={[
        styles.statusPill,
        { backgroundColor: active ? "rgba(25, 135, 84, 0.92)" : "rgba(86, 83, 78, 0.9)" },
      ]}
    >
      <View style={[styles.statusDot, { backgroundColor: active ? "#BFF2D2" : theme.border }]} />
      <Text style={styles.statusPillText}>{active ? "Abierto" : "Cerrado"}</Text>
    </View>
  );
}

function OptionalRating({
  data,
  variant = "dark",
}: {
  data: ReturnType<typeof getRatingData>;
  variant?: "dark" | "light";
}) {
  const theme = useThemeColors();
  if (!data) return null;

  return (
    <View
      style={[
        styles.ratingPill,
        variant === "dark"
          ? styles.ratingPillDark
          : { backgroundColor: theme.primaryFaint },
      ]}
    >
      <MaterialCommunityIcons name="star" size={12} color="#F7B731" />
      <Text
        style={[
          styles.ratingText,
          { color: variant === "dark" ? "#FFFFFF" : theme.textPrimary },
        ]}
      >
        {data.rating.toFixed(1)} ({data.count})
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  explore: {
    gap: spacing.sm,
  },
  exploreContent: {
    gap: 10,
  },
  exploreHeader: {
    gap: 0,
    paddingTop: 2,
    paddingBottom: 0,
  },
  exploreTitle: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: typography.weights.bold,
  },
  exploreSubtitle: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: typography.weights.semiBold,
  },
  searchBlock: {
    gap: spacing.xs,
  },
  searchRow: {
    minHeight: 48,
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
    borderRadius: 17,
    borderWidth: 1,
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
  },
  searchFilterButton: {
    width: 48,
    height: 48,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  filterBadge: {
    position: "absolute",
    top: 7,
    right: 7,
    minWidth: 16,
    height: 16,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  filterBadgeText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: typography.weights.extraBold,
  },
  suggestionsPanel: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    ...designSystem.shadows.low,
  },
  suggestionRow: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  suggestionThumb: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  suggestionText: {
    flex: 1,
    minWidth: 0,
  },
  suggestionTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: typography.weights.bold,
  },
  suggestionMeta: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: typography.weights.semiBold,
  },
  typeSelector: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    padding: 3,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  typeActiveIndicator: {
    position: "absolute",
    top: 3,
    bottom: 3,
    left: 3,
    borderRadius: 13,
  },
  typeOption: {
    flex: 1,
    minHeight: 35,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderRadius: 13,
  },
  typeOptionText: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: typography.weights.semiBold,
  },
  discoveryControls: {
    minHeight: 64,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: spacing.sm,
    rowGap: 6,
  },
  quickFilterRow: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
  },
  quickFilterChip: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: designSystem.radii.pill,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
  },
  quickFilterText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: typography.weights.bold,
  },
  activeFiltersWrap: {
    minHeight: 32,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.xs,
  },
  activeFilterChip: {
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: designSystem.radii.pill,
    borderWidth: 1,
  },
  activeFilterText: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: typography.weights.bold,
    maxWidth: 170,
  },
  activeFilterClear: {
    minHeight: 30,
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
  },
  activeFilterClearText: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: typography.weights.bold,
  },
  resultsSummaryRow: {
    minHeight: 24,
    flex: 1,
    minWidth: 210,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.xs,
  },
  resultsSummaryText: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: typography.weights.semiBold,
  },
  sortButton: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    justifyContent: "center",
    maxWidth: 150,
  },
  sortButtonText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: typography.weights.bold,
  },
  sortModalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.32)",
  },
  sortModalSheet: {
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    ...designSystem.shadows.medium,
  },
  sortModalHeader: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  sortModalTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: typography.weights.extraBold,
  },
  sortModalClose: {
    width: 36,
    height: 36,
    borderRadius: designSystem.radii.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  sortOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  filterModalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.42)",
  },
  filterModalSheet: {
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    ...designSystem.shadows.medium,
  },
  filterModalHeader: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  filterModalTitle: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: typography.weights.extraBold,
  },
  filterModalIconButton: {
    width: 38,
    height: 38,
    borderRadius: designSystem.radii.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  filterModalOptions: {
    gap: spacing.xs,
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
  customBudgetField: {
    minHeight: 42,
    maxWidth: 170,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: 14,
    borderWidth: 1,
  },
  budgetPrefix: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: typography.weights.bold,
  },
  customBudgetInput: {
    flex: 1,
    minHeight: 38,
    fontSize: 14,
    paddingVertical: 0,
  },
  filterHint: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: typography.weights.semiBold,
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
  exploreSection: {
    gap: 10,
    marginTop: spacing.md,
  },
  exploreSectionHeader: {
    minHeight: 26,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  exploreSectionTitle: {
    fontSize: 19,
    lineHeight: 24,
    fontWeight: typography.weights.extraBold,
  },
  restaurantCarousel: {
    gap: 11,
    paddingRight: spacing.xxxl,
  },
  restaurantCard: {
    width: 168,
    height: 202,
    position: "relative",
    overflow: "hidden",
    borderRadius: 18,
    borderWidth: 1,
    ...designSystem.shadows.medium,
  },
  restaurantCardImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  restaurantGradientSoft: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "58%",
    backgroundColor: "rgba(0, 0, 0, 0.26)",
    borderRadius: 18,
  },
  restaurantGradientDeep: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "34%",
    backgroundColor: "rgba(0, 0, 0, 0.34)",
    borderRadius: 18,
  },
  restaurantCardCopy: {
    position: "absolute",
    left: 13,
    right: 13,
    bottom: 13,
    gap: 4,
  },
  restaurantCardTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    lineHeight: 22,
    fontWeight: typography.weights.extraBold,
    textShadowColor: "rgba(0, 0, 0, 0.28)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  restaurantCardMeta: {
    color: "rgba(255, 245, 232, 0.88)",
    fontSize: 13,
    lineHeight: 16,
    fontWeight: typography.weights.bold,
    textShadowColor: "rgba(0, 0, 0, 0.22)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  restaurantTopRow: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.xs,
  },
  statusPill: {
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: spacing.sm,
    borderRadius: designSystem.radii.pill,
  },
  statusPillText: {
    color: "#FFFFFF",
    fontSize: 12,
    lineHeight: 15,
    fontWeight: typography.weights.bold,
  },
  ratingPill: {
    alignSelf: "flex-start",
    minHeight: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: spacing.xs,
    borderRadius: designSystem.radii.pill,
  },
  ratingPillDark: {
    backgroundColor: "rgba(0, 0, 0, 0.46)",
  },
  ratingText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: typography.weights.bold,
  },
  restaurantRow: {
    minHeight: 88,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    padding: 8,
    borderRadius: 16,
    borderWidth: 1,
    ...designSystem.shadows.low,
  },
  restaurantRowImage: {
    width: 74,
    height: 72,
    borderRadius: 13,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: 11,
    lineHeight: 14,
    fontWeight: typography.weights.bold,
  },
  resultName: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: typography.weights.extraBold,
  },
  resultDescription: {
    fontSize: 12,
    lineHeight: 15,
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
  favoriteButton: {
    width: 42,
    height: 42,
    borderRadius: designSystem.radii.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  dishCarousel: {
    gap: 11,
    paddingRight: spacing.xxxl,
  },
  exploreDishCard: {
    width: 148,
    height: 192,
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
  dishImageShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
  exploreDishFavorite: {
    position: "absolute",
    top: 5,
    right: 5,
  },
  exploreDishBody: {
    flex: 1,
    justifyContent: "flex-start",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  exploreDishPrice: {
    marginTop: "auto",
  },
  resultPrice: {
    fontSize: 14,
    lineHeight: 17,
    fontWeight: typography.weights.extraBold,
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
  feedbackStack: {
    gap: spacing.md,
  },
  feedbackState: {
    marginTop: spacing.md,
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.5,
  },
});
