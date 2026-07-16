import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { spacing } from "../../constants/spacing";
import type { Dish } from "../../services/dishService";
import { designSystem, typography } from "../../theme";
import { StudentSectionHeader } from "../StudentSectionHeader";
import { RestaurantDishCard } from "./RestaurantDishCard";
import { RestaurantDishesFeedback } from "./RestaurantDishesFeedback";

type RestaurantDishesSectionProps = {
  dishes: Dish[];
  error: string | null;
  isCheckingReservation: boolean;
  isReservingDishId: string | null;
  loading: boolean;
  onReload: () => void;
  onDishPress: (dish: Dish) => void;
  reservedDishIdSet: Set<string>;
};

export function RestaurantDishesSection({
  dishes,
  error,
  isCheckingReservation,
  isReservingDishId,
  loading,
  onReload,
  onDishPress,
}: RestaurantDishesSectionProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const values = dishes
      .map((dish) => dish.category?.trim())
      .filter((value): value is string => Boolean(value));
    return Array.from(new Set(values));
  }, [dishes]);

  const filteredDishes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return dishes.filter((dish) => {
      const matchesQuery =
        !normalizedQuery ||
        dish.name.toLowerCase().includes(normalizedQuery) ||
        dish.description?.toLowerCase().includes(normalizedQuery);
      const matchesCategory = !category || dish.category === category;

      return matchesQuery && matchesCategory;
    });
  }, [category, dishes, query]);

  return (
    <View style={styles.section}>
      <StudentSectionHeader
        count={loading ? "..." : filteredDishes.length}
        iconName="food-outline"
        subtitle="Elige un plato disponible"
        title="Menú del día"
      />

      <View style={styles.searchBar}>
        <MaterialCommunityIcons
          name="magnify"
          size={designSystem.iconSizes.sm}
          color={designSystem.colors.textMuted}
        />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar plato"
          placeholderTextColor={designSystem.colors.textMuted}
          style={styles.searchInput}
        />
      </View>

      {categories.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          <CategoryPill
            label="Todo"
            selected={!category}
            onPress={() => setCategory(null)}
          />
          {categories.map((item) => (
            <CategoryPill
              key={item}
              label={item}
              selected={category === item}
              onPress={() => setCategory(item)}
            />
          ))}
        </ScrollView>
      ) : null}

      {loading ? (
        <RestaurantDishesFeedback variant="loading" style={styles.feedbackState} />
      ) : error ? (
        <RestaurantDishesFeedback
          variant="error"
          error={error}
          onRetry={onReload}
          style={styles.feedbackState}
        />
      ) : filteredDishes.length > 0 ? (
        <View style={styles.menuList}>
          {filteredDishes.map((dish, index) => {
            const dishId = String(dish.id);

            return (
              <RestaurantDishCard
                key={dishId}
                dish={dish}
                index={index}
                onPress={onDishPress}
              />
            );
          })}
        </View>
      ) : (
        <RestaurantDishesFeedback variant="empty" style={styles.feedbackState} />
      )}
    </View>
  );
}

function CategoryPill({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Text
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.categoryPill, selected && styles.categoryPillSelected]}
    >
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.sm,
  },
  searchBar: {
    minHeight: 42,
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 14,
    backgroundColor: designSystem.colors.surface,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
  },
  searchInput: {
    flex: 1,
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.sm,
    paddingVertical: spacing.sm,
  },
  categoryList: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  categoryPill: {
    minHeight: 34,
    overflow: "hidden",
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: designSystem.colors.textSecondary,
    backgroundColor: designSystem.colors.surface,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  categoryPillSelected: {
    color: designSystem.colors.textInverted,
    backgroundColor: designSystem.colors.primary,
    borderColor: designSystem.colors.primary,
  },
  menuList: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  feedbackState: {
    marginTop: spacing.md,
  },
});
