import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "../constants/api";
import { useAuth } from "../context/AuthContex";
import { Dish, getPublicDishesByRestaurant } from "../services/dishService";

type DishAvailabilityPayload = {
  dish_id: string;
  restaurant_id: string;
};

type ServerToClientEvents = {
  dish_hidden: (payload: DishAvailabilityPayload) => void;
  dish_available: (payload: DishAvailabilityPayload) => void;
};

type ClientToServerEvents = Record<string, never>;

export function useDishesByRestaurant(restaurantId: string) {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
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
    } catch {
      if (seq !== refreshSeqRef.current) return;
      if (String(restaurantIdRef.current) !== requestedRestaurantId) return;
      setDishes([]);
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

    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
      SOCKET_URL,
      {
        transports: ["websocket"],
        auth: {
          token: accessToken,
        },
        autoConnect: true,
        reconnection: true,
      }
    );

    socketRef.current = socket;

    const shouldHandle = (payload: DishAvailabilityPayload) => {
      const rid = String(payload?.restaurant_id ?? "");
      return rid.length > 0 && rid === String(restaurantIdRef.current);
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

    socket.on("dish_hidden", handleDishHidden);
    socket.on("dish_available", handleDishAvailable);

    return () => {
      socket.off("dish_hidden", handleDishHidden);
      socket.off("dish_available", handleDishAvailable);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, restaurantId, refreshDishes, scheduleRefresh]);

  return { dishes, loading };
}
