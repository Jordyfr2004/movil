import { useEffect, useState } from "react";
import { Dish, getPublicDishesByRestaurant } from "../services/dishService";

export function useDishesByRestaurant(restaurantId: string) {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    setLoading(true);

    getPublicDishesByRestaurant(restaurantId)
      .then((data) => {
        if (isMounted) setDishes(data);
      })
      .catch(() => {
        if (isMounted) setDishes([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [restaurantId]);

  return { dishes, loading };
}
