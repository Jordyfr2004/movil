import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { acquireNotificationsSocket, releaseNotificationsSocket } from "../services/notificationsSocket";
import { Dish, getPublicDishesByRestaurant } from "../services/dishService";
import type { Socket } from "socket.io-client";

type DishAvailabilityPayload = {
  dish_id: string;
  restaurant_id: string;
};

type MenuAvailablePayload = {
  restaurant_id: string;
  message: string;
};

type DishChangedPayload = {
  dish: any;
};

type ServerToClientEvents = {
  menu_available: (payload: MenuAvailablePayload) => void;
  dish_hidden: (payload: DishAvailabilityPayload) => void;
  dish_available: (payload: DishAvailabilityPayload) => void;
  dish_created: (payload: DishChangedPayload) => void;
  dish_updated: (payload: DishChangedPayload) => void;
  dish_deleted: (payload: DishAvailabilityPayload) => void;
};

type ClientToServerEvents = Record<string, never>;

export function useDishesByRestaurant(restaurantId: string) {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { accessToken } = useAuth();
  const restaurantIdRef = useRef(restaurantId);
  const refreshSeqRef = useRef(0);
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const refreshDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  restaurantIdRef.current = restaurantId;

  const refreshDishes = useCallback(async (showLoading: boolean) => {
    if (!restaurantIdRef.current) {
      setDishes([]);
      setLoading(false);
      setError(null);
      return;
    }

    const seq = ++refreshSeqRef.current;
    const requestedRestaurantId = String(restaurantIdRef.current);

    if (showLoading) setLoading(true);

    try {
      const data = await getPublicDishesByRestaurant(requestedRestaurantId);
      if (seq !== refreshSeqRef.current) return;
      if (String(restaurantIdRef.current) !== requestedRestaurantId) return;
      setDishes(data);
      setError(null);
    } catch (reason: unknown) {
      if (seq !== refreshSeqRef.current) return;
      if (String(restaurantIdRef.current) !== requestedRestaurantId) return;
      setDishes([]);
      setError(
        reason instanceof Error
          ? reason.message
          : "No se pudieron cargar los platos"
      );
    } finally {
      if (seq !== refreshSeqRef.current) return;
      if (String(restaurantIdRef.current) !== requestedRestaurantId) return;
      if (showLoading) setLoading(false);
    }
  }, []);

  const scheduleRefresh = useCallback((delayMs: number) => {
    if (refreshDebounceTimerRef.current) {
      clearTimeout(refreshDebounceTimerRef.current);
    }

    refreshDebounceTimerRef.current = setTimeout(() => {
      refreshDebounceTimerRef.current = null;
      refreshDishes(false);
    }, delayMs);
  }, [refreshDishes]);

  useEffect(() => {
    refreshDishes(true);
  }, [restaurantId, refreshDishes]);

  useEffect(() => {
    return () => {
      if (refreshDebounceTimerRef.current) {
        clearTimeout(refreshDebounceTimerRef.current);
        refreshDebounceTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!accessToken) return;
    if (!restaurantId) return;

    const socket = acquireNotificationsSocket(accessToken) as Socket<
      ServerToClientEvents,
      ClientToServerEvents
    >;

    socketRef.current = socket;

    const shouldHandle = (payload: DishAvailabilityPayload) => {
      const rid = String(payload?.restaurant_id ?? "");
      return rid.length > 0 && rid === String(restaurantIdRef.current);
    };

    const shouldHandleRestaurantId = (rid: unknown) => {
      const normalized = String(rid ?? "");
      return normalized.length > 0 && normalized === String(restaurantIdRef.current);
    };

    const handleDishHidden = (payload: DishAvailabilityPayload) => {
      if (!shouldHandle(payload)) return;
      const dishId = String(payload?.dish_id ?? "");
      if (dishId) {
        // Update inmediato: el plato oculto desaparece al instante.
        setDishes((previous) => previous.filter((dish) => String(dish.id) !== dishId));
      }

      // Refresco con debounce para evitar tormenta de GETs si se ocultan muchos platos.
      scheduleRefresh(450);
    };

    const handleDishAvailable = (payload: DishAvailabilityPayload) => {
      if (!shouldHandle(payload)) return;
      // No tenemos los detalles del plato; refrescamos con debounce.
      scheduleRefresh(450);
    };

    const handleMenuAvailable = (payload: MenuAvailablePayload) => {
      if (!shouldHandleRestaurantId(payload?.restaurant_id)) return;
      scheduleRefresh(450);
    };

    const handleDishCreated = (payload: DishChangedPayload) => {
      const dish = payload?.dish;
      const rid = dish?.restaurant_id ?? dish?.restaurantId;
      if (!shouldHandleRestaurantId(rid)) return;
      scheduleRefresh(450);
    };

    const handleDishUpdated = (payload: DishChangedPayload) => {
      const dish = payload?.dish;
      const rid = dish?.restaurant_id ?? dish?.restaurantId;
      if (!shouldHandleRestaurantId(rid)) return;
      scheduleRefresh(450);
    };

    const handleDishDeleted = (payload: DishAvailabilityPayload) => {
      if (!shouldHandle(payload)) return;

      const dishId = String(payload?.dish_id ?? "");
      if (dishId) {
        setDishes((previous) => previous.filter((dish) => String(dish.id) !== dishId));
      }

      scheduleRefresh(450);
    };

    socket.on("menu_available", handleMenuAvailable);
    socket.on("dish_hidden", handleDishHidden);
    socket.on("dish_available", handleDishAvailable);
    socket.on("dish_created", handleDishCreated);
    socket.on("dish_updated", handleDishUpdated);
    socket.on("dish_deleted", handleDishDeleted);

    return () => {
      socket.off("menu_available", handleMenuAvailable);
      socket.off("dish_hidden", handleDishHidden);
      socket.off("dish_available", handleDishAvailable);
      socket.off("dish_created", handleDishCreated);
      socket.off("dish_updated", handleDishUpdated);
      socket.off("dish_deleted", handleDishDeleted);
      socketRef.current = null;

      releaseNotificationsSocket(accessToken);
    };
  }, [accessToken, restaurantId, refreshDishes, scheduleRefresh]);

  return {
    dishes,
    loading,
    error,
    reload: () => refreshDishes(true),
  };
}
