import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
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
import {
  getDishImageSource,
  getRestaurantImageSource,
} from "../utils/foodImages";

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

const TYPE_OPTIONS: Array<{ key: ResultType; label: string }> = [
  { key: "all", label: "Todos" },
  { key: "restaurants", label: "Restaurantes" },
  { key: "dishes", label: "Platos" },
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
  if (sort === "priceAsc") return "Precio: menor a mayor";
  if (sort === "priceDesc") return "Precio: mayor a menor";
  if (sort === "nameAsc") return "Nombre A-Z";
  return "Relevancia";
}

function getResultsSummary(restaurantCount: number, dishCount: number) {
  if (restaurantCount > 0 && dishCount > 0) {
    return `${restaurantCount} ${restaurantCount === 1 ? "restaurante" : "restaurantes"} y ${dishCount} ${dishCount === 1 ? "plato" : "platos"}`;
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

        <ExploreTypeSelector value={resultType} onChange={setResultType} />

        <ExploreQuickFilter
          selected={openOnly}
          onPress={() => setOpenOnly((current) => !current)}
        />

        {hasAdvancedFilters(filters) ? (
          <ExploreActiveFilters
            filters={filters}
            onClearAll={() => setFilters(DEFAULT_ADVANCED_FILTERS)}
            onClearFilter={clearAdvancedFilter}
          />
        ) : null}

        <ExploreResultsSummary
          label={resultsSummary}
          sortLabel={getSortLabel(sort)}
          onPressSort={() => setSortModalVisible(true)}
        />

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
                {visibleRestaurants.map((restaurant, index) => (
                  <ExploreRestaurantRow
                    key={`restaurant-${restaurant.id}`}
                    index={index}
                    restaurant={restaurant}
                    dishCount={restaurantDishCounts.get(String(restaurant.id)) ?? 0}
                    onPress={() => onOpenRestaurant(restaurant)}
                  />
                ))}
              </View>
            ) : null}

            {visibleDishes.length > 0 ? (
              <View style={styles.exploreSection}>
                <ExploreSectionHeader title="Platos disponibles" />
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

  return (
    <View style={styles.exploreHeader}>
      <View style={[styles.headerAccent, { backgroundColor: theme.primary }]} />
      <Text style={[styles.exploreTitle, { color: theme.textPrimary }]}>
        Explorar
      </Text>
      <Text style={[styles.exploreSubtitle, { color: theme.textSecondary }]}>
        Descubre restaurantes y platos
      </Text>
    </View>
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
            { backgroundColor: theme.primaryFaint, borderColor: theme.primarySoft },
          ]}
        >
          <MaterialCommunityIcons name="magnify" size={20} color={theme.primary} />
          <TextInput
            value={query}
            onChangeText={onChangeQuery}
            onFocus={onFocus}
            placeholder="Buscar platos o restaurantes"
            placeholderTextColor={theme.textMuted}
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
              backgroundColor: advancedFilterCount ? theme.primary : theme.primaryFaint,
              borderColor: theme.primarySoft,
            },
            pressed && styles.pressed,
          ]}
        >
          <MaterialCommunityIcons
            name="tune-variant"
            size={22}
            color={advancedFilterCount ? theme.textInverted : theme.primary}
          />
          {advancedFilterCount ? (
            <View style={[styles.filterBadge, { backgroundColor: theme.textInverted }]}>
              <Text style={[styles.filterBadgeText, { color: theme.primary }]}>
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
          <Image
            source={getRestaurantImageSource(suggestion.restaurant)}
            style={styles.resultImage}
            resizeMode="cover"
          />
        ) : suggestion.type === "dish" ? (
          <Image
            source={getDishImageSource(suggestion.dish, suggestion.restaurant)}
            style={styles.resultImage}
            resizeMode="cover"
          />
        ) : (
          <MaterialCommunityIcons name={iconName} size={18} color={theme.primary} />
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

  return (
    <View
      style={[
        styles.typeSelector,
        { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
      ]}
    >
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
              selected && { backgroundColor: theme.primary },
              pressed && styles.pressed,
            ]}
          >
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
  const budgetLabel = getBudgetLabel(filters);
  const chips: Array<{ key: keyof AdvancedFilters; label: string }> = [];

  if (budgetLabel) {
    chips.push({ key: "budgetPreset", label: budgetLabel });
  }

  if (filters.availability !== "all") {
    chips.push({ key: "availability", label: "Disponibles" });
  }

  if (chips.length === 0) return null;

  return (
    <View style={styles.activeFiltersWrap}>
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
    </View>
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
        <Text style={[styles.sortButtonText, { color: theme.primary }]} numberOfLines={1}>
          Ordenar: {sortLabel}
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
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
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
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
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
      {[0, 1, 2].map((item) => (
        <View
          key={`restaurant-skeleton-${item}`}
          style={[
            styles.restaurantRow,
            { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
          ]}
        >
          <View style={[styles.restaurantRowImage, { backgroundColor: theme.surfaceSecondary }]} />
          <View style={styles.skeletonTextStack}>
            <View style={[styles.skeletonLineLarge, { backgroundColor: theme.surfaceSecondary }]} />
            <View style={[styles.skeletonLine, { backgroundColor: theme.surfaceSecondary }]} />
            <View style={[styles.skeletonLineShort, { backgroundColor: theme.surfaceSecondary }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

function ExploreRestaurantRow({
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

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver restaurante ${restaurant.name}`}
        onPress={onPress}
        style={({ pressed }) => [
          styles.restaurantRow,
          { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
          pressed && styles.pressed,
        ]}
      >
        <View style={[styles.restaurantRowImage, { backgroundColor: theme.surfaceSecondary }]}>
          <Image
            source={getRestaurantImageSource(restaurant)}
            style={styles.resultImage}
            resizeMode="cover"
          />
        </View>
        <View style={styles.resultText}>
          <Text
            style={[styles.resultName, { color: theme.textPrimary }]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {restaurant.name}
          </Text>
          {summary ? (
            <Text
              style={[styles.resultDescription, { color: theme.textSecondary }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {summary}
            </Text>
          ) : null}
          <View style={styles.restaurantMetaRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: restaurant.isActive ? theme.success : theme.neutral },
              ]}
            />
            <Text
              style={[
                styles.resultStatus,
                { color: restaurant.isActive ? theme.success : theme.neutral },
              ]}
              numberOfLines={1}
            >
              {restaurant.isActive ? "Abierto" : "Cerrado"}
            </Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={favorite ? "Quitar favorito" : "Guardar favorito"}
          onPress={(event) => {
            event.stopPropagation();
            toggleRestaurant(restaurant);
          }}
          style={[
            styles.favoriteButton,
            { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
          ]}
        >
          <MaterialCommunityIcons
            name={favorite ? "heart" : "heart-outline"}
            size={20}
            color={theme.primary}
          />
        </Pressable>
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
  const opacity = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(reduceMotion ? 0 : 10)).current;
  const { dish, restaurant } = result;
  const { isDishFavorite, toggleDish } = useFavorites();
  const favorite = isDishFavorite(dish.id);

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
          <Image
            source={getDishImageSource(dish, restaurant)}
            style={styles.resultImage}
            resizeMode="cover"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={favorite ? "Quitar favorito" : "Guardar favorito"}
            onPress={(event) => {
              event.stopPropagation();
              toggleDish(restaurant, dish);
            }}
            style={[
              styles.exploreDishFavorite,
              { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
            ]}
          >
            <MaterialCommunityIcons
              name={favorite ? "heart" : "heart-outline"}
              size={20}
              color={theme.primary}
            />
          </Pressable>
        </View>
        <View style={styles.exploreDishBody}>
          <Text
            style={[styles.resultName, { color: theme.textPrimary }]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {dish.name}
          </Text>
          <Text
            style={[styles.resultRestaurant, { color: theme.textSecondary }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {restaurant.name}
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

const styles = StyleSheet.create({
  explore: {
    gap: spacing.sm,
  },
  exploreContent: {
    gap: spacing.sm,
  },
  exploreHeader: {
    gap: 2,
  },
  headerAccent: {
    width: 24,
    height: 2,
    borderRadius: 999,
    marginBottom: 2,
  },
  exploreTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: typography.weights.extraBold,
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
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  searchBar: {
    flex: 1,
    minHeight: 50,
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
    width: 50,
    height: 50,
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
    minHeight: 39,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    padding: 3,
    borderRadius: 16,
    borderWidth: 1,
  },
  typeOption: {
    flex: 1,
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
  },
  typeOptionText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: typography.weights.bold,
  },
  quickFilterRow: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
  },
  quickFilterChip: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.md,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  resultsSummaryText: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: typography.weights.semiBold,
  },
  sortButton: {
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    justifyContent: "center",
    maxWidth: 178,
  },
  sortButtonText: {
    fontSize: 12,
    lineHeight: 15,
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
    gap: spacing.sm,
    paddingRight: spacing.xxxl,
  },
  exploreDishCard: {
    width: 148,
    height: 180,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    ...designSystem.shadows.low,
  },
  exploreDishMedia: {
    height: 100,
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
