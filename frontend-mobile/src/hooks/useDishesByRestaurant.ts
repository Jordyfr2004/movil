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

  useEffect(() => {
    refreshDishes(true);
  }, [restaurantId, refreshDishes]);

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
      // Refresco en segundo plano para mantener consistencia con backend.
      refreshDishes(false);
    };

    const handleDishAvailable = (payload: DishAvailabilityPayload) => {
      if (!shouldHandle(payload)) return;
      refreshDishes(false);
    };

    socket.on("dish_hidden", handleDishHidden);
    socket.on("dish_available", handleDishAvailable);

    return () => {
      socket.off("dish_hidden", handleDishHidden);
      socket.off("dish_available", handleDishAvailable);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, restaurantId, refreshDishes]);

  return { dishes, loading };
}
