import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";

import { Dish } from "../services/dishService";
import { Restaurant } from "../types/models";

const FAVORITES_STORAGE_KEY = "student_favorites_v1";

export type FavoriteRestaurant = {
  id: string;
  name: string;
  imageUrl?: string | null;
  location?: string;
  description?: string;
  isActive?: boolean;
};

export type FavoriteDish = {
  id: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  description?: string;
  price: string;
  imageUrl?: string;
  isAvailable?: boolean;
  isActive?: boolean;
};

type FavoritesState = {
  restaurants: FavoriteRestaurant[];
  dishes: FavoriteDish[];
};

type FavoritesContextValue = FavoritesState & {
  isRestaurantFavorite: (restaurantId: string | number) => boolean;
  isDishFavorite: (dishId: string | number) => boolean;
  toggleRestaurant: (restaurant: Restaurant) => void;
  toggleDish: (restaurant: Restaurant, dish: Dish) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

function sanitizeFavorites(value: unknown): FavoritesState {
  if (typeof value !== "object" || value === null) {
    return { restaurants: [], dishes: [] };
  }

  const source = value as Partial<FavoritesState>;
  return {
    restaurants: Array.isArray(source.restaurants)
      ? source.restaurants.filter(
          (item): item is FavoriteRestaurant =>
            typeof item === "object" &&
            item !== null &&
            typeof item.id === "string" &&
            typeof item.name === "string"
        )
      : [],
    dishes: Array.isArray(source.dishes)
      ? source.dishes.filter(
          (item): item is FavoriteDish =>
            typeof item === "object" &&
            item !== null &&
            typeof item.id === "string" &&
            typeof item.restaurantId === "string" &&
            typeof item.restaurantName === "string" &&
            typeof item.name === "string"
        )
      : [],
  };
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FavoritesState>({
    restaurants: [],
    dishes: [],
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    SecureStore.getItemAsync(FAVORITES_STORAGE_KEY)
      .then((raw) => {
        if (!raw || !mounted) return;
        setState(sanitizeFavorites(JSON.parse(raw)));
      })
      .catch(() => undefined)
      .finally(() => {
        if (mounted) setHydrated(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    SecureStore.setItemAsync(FAVORITES_STORAGE_KEY, JSON.stringify(state)).catch(
      () => undefined
    );
  }, [hydrated, state]);

  const isRestaurantFavorite = useCallback(
    (restaurantId: string | number) =>
      state.restaurants.some((item) => item.id === String(restaurantId)),
    [state.restaurants]
  );

  const isDishFavorite = useCallback(
    (dishId: string | number) =>
      state.dishes.some((item) => item.id === String(dishId)),
    [state.dishes]
  );

  const toggleRestaurant = useCallback((restaurant: Restaurant) => {
    const id = String(restaurant.id);
    setState((previous) => {
      if (previous.restaurants.some((item) => item.id === id)) {
        return {
          ...previous,
          restaurants: previous.restaurants.filter((item) => item.id !== id),
        };
      }

      return {
        ...previous,
        restaurants: [
          {
            id,
            name: restaurant.name,
            imageUrl: restaurant.imageUrl,
            location: restaurant.location,
            description: restaurant.description,
            isActive: restaurant.isActive,
          },
          ...previous.restaurants,
        ],
      };
    });
  }, []);

  const toggleDish = useCallback((restaurant: Restaurant, dish: Dish) => {
    const id = String(dish.id);
    setState((previous) => {
      if (previous.dishes.some((item) => item.id === id)) {
        return {
          ...previous,
          dishes: previous.dishes.filter((item) => item.id !== id),
        };
      }

      return {
        ...previous,
        dishes: [
          {
            id,
            restaurantId: String(restaurant.id),
            restaurantName: restaurant.name,
            name: dish.name,
            description: dish.description,
            price: dish.price,
            imageUrl: dish.imageUrl,
            isAvailable: dish.isAvailable,
            isActive: dish.isActive,
          },
          ...previous.dishes,
        ],
      };
    });
  }, []);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      restaurants: state.restaurants,
      dishes: state.dishes,
      isRestaurantFavorite,
      isDishFavorite,
      toggleRestaurant,
      toggleDish,
    }),
    [isDishFavorite, isRestaurantFavorite, state, toggleDish, toggleRestaurant]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const value = useContext(FavoritesContext);
  if (!value) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return value;
}
