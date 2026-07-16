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

const CART_STORAGE_KEY = "student_cart_v1";

export type CartItem = {
  key: string;
  dishId: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  quantity: number;
  notes: string;
};

export type CartRestaurant = {
  id: string;
  name: string;
};

export type RemovedCartItem = {
  item: CartItem;
  index: number;
};

type AddToCartResult =
  | { status: "added" }
  | { status: "restaurant-conflict" };

type CartState = {
  restaurant: CartRestaurant | null;
  items: CartItem[];
};

type CartContextValue = CartState & {
  itemCount: number;
  subtotal: number;
  total: number;
  addDish: (
    restaurant: Restaurant,
    dish: Dish,
    quantity: number,
    notes: string,
    replaceRestaurant?: boolean
  ) => AddToCartResult;
  clearCart: () => void;
  removeItem: (key: string) => RemovedCartItem | null;
  restoreItem: (removed: RemovedCartItem) => void;
  updateQuantity: (key: string, quantity: number) => void;
  updateNotes: (key: string, notes: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function normalizePrice(value: string) {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildItemKey(dishId: string, notes: string) {
  return `${dishId}:${notes.trim().toLowerCase()}`;
}

function sanitizeCart(value: unknown): CartState {
  if (typeof value !== "object" || value === null) {
    return { restaurant: null, items: [] };
  }

  const candidate = value as Partial<CartState>;
  const restaurant =
    candidate.restaurant &&
    typeof candidate.restaurant.id === "string" &&
    typeof candidate.restaurant.name === "string"
      ? candidate.restaurant
      : null;

  const items = Array.isArray(candidate.items)
    ? candidate.items.filter((item): item is CartItem => {
        return (
          typeof item === "object" &&
          item !== null &&
          typeof item.key === "string" &&
          typeof item.dishId === "string" &&
          typeof item.restaurantId === "string" &&
          typeof item.restaurantName === "string" &&
          typeof item.name === "string" &&
          typeof item.price === "number" &&
          typeof item.quantity === "number" &&
          typeof item.notes === "string"
        );
      })
    : [];

  return {
    restaurant: items.length > 0 ? restaurant : null,
    items,
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>({
    restaurant: null,
    items: [],
  });
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    SecureStore.getItemAsync(CART_STORAGE_KEY)
      .then((raw) => {
        if (!raw || !isMounted) return;
        setState(sanitizeCart(JSON.parse(raw)));
      })
      .catch(() => undefined)
      .finally(() => {
        if (isMounted) {
          setIsHydrated(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    SecureStore.setItemAsync(CART_STORAGE_KEY, JSON.stringify(state)).catch(
      () => undefined
    );
  }, [isHydrated, state]);

  const subtotal = useMemo(
    () =>
      state.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
    [state.items]
  );

  const itemCount = useMemo(
    () => state.items.reduce((sum, item) => sum + item.quantity, 0),
    [state.items]
  );

  const clearCart = useCallback(() => {
    setState({ restaurant: null, items: [] });
  }, []);

  const addDish = useCallback<CartContextValue["addDish"]>(
    (restaurant, dish, quantity, notes, replaceRestaurant = false) => {
      const restaurantId = String(restaurant.id);
      const currentRestaurantId = state.restaurant?.id;

      if (
        currentRestaurantId &&
        currentRestaurantId !== restaurantId &&
        !replaceRestaurant
      ) {
        return { status: "restaurant-conflict" };
      }

      const trimmedNotes = notes.trim();
      const key = buildItemKey(String(dish.id), trimmedNotes);
      const nextRestaurant = {
        id: restaurantId,
        name: restaurant.name,
      };

      const nextItem: CartItem = {
        key,
        dishId: String(dish.id),
        restaurantId,
        restaurantName: restaurant.name,
        name: dish.name,
        description: dish.description,
        imageUrl: dish.imageUrl,
        price: normalizePrice(dish.price),
        quantity,
        notes: trimmedNotes,
      };

      setState((previous) => {
        const baseItems = replaceRestaurant ? [] : previous.items;
        const existing = baseItems.find((item) => item.key === key);
        const items = existing
          ? baseItems.map((item) =>
              item.key === key
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          : [...baseItems, nextItem];

        return {
          restaurant: nextRestaurant,
          items,
        };
      });

      return { status: "added" };
    },
    [state.restaurant?.id]
  );

  const removeItem = useCallback(
    (key: string) => {
      const index = state.items.findIndex((item) => item.key === key);

      if (index < 0) {
        return null;
      }

      const removed = {
        item: state.items[index],
        index,
      };

      setState((previous) => {
        const items = previous.items.filter((item) => item.key !== key);
        return {
          restaurant: items.length > 0 ? previous.restaurant : null,
          items,
        };
      });

      return removed;
    },
    [state.items]
  );

  const restoreItem = useCallback((removed: RemovedCartItem) => {
    setState((previous) => ({
      restaurant:
        previous.restaurant ?? {
          id: removed.item.restaurantId,
          name: removed.item.restaurantName,
        },
      items: previous.items.some((current) => current.key === removed.item.key)
        ? previous.items
        : [
            ...previous.items.slice(0, removed.index),
            removed.item,
            ...previous.items.slice(removed.index),
          ],
    }));
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    const nextQuantity = Math.max(1, Math.min(99, quantity));
    setState((previous) => ({
      ...previous,
      items: previous.items.map((item) =>
        item.key === key ? { ...item, quantity: nextQuantity } : item
      ),
    }));
  }, []);

  const updateNotes = useCallback((key: string, notes: string) => {
    setState((previous) => ({
      ...previous,
      items: previous.items.map((item) =>
        item.key === key ? { ...item, notes: notes.slice(0, 140) } : item
      ),
    }));
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      restaurant: state.restaurant,
      items: state.items,
      itemCount,
      subtotal,
      total: subtotal,
      addDish,
      clearCart,
      removeItem,
      restoreItem,
      updateQuantity,
      updateNotes,
    }),
    [
      addDish,
      clearCart,
      itemCount,
      removeItem,
      restoreItem,
      state.items,
      state.restaurant,
      subtotal,
      updateNotes,
      updateQuantity,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) {
    throw new Error("useCart must be used within CartProvider");
  }

  return value;
}
