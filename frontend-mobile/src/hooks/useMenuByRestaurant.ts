import { useEffect, useState } from "react";
import { Menu } from "../types/models";
import { getMenuByRestaurant } from "../services/menuService";

export function useMenuByRestaurant(restaurantId: number) {
  const [menu, setMenu] = useState<Menu | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getMenuByRestaurant(restaurantId)
      .then((data) => {
        if (isMounted) {
          setMenu(data);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [restaurantId]);

  return { menu, loading };
}
