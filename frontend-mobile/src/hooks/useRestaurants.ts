import { useEffect, useState } from "react";
import { Restaurant } from "../types/models";
import { getRestaurants } from "../services/restaurantService";

export function useRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getRestaurants()
      .then((data) => {
        if (isMounted) {
          setRestaurants(data.filter((item) => item.isActive));
        }
      })
      .catch(() => {
        if (isMounted) {
          setRestaurants([]);
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
  }, []);

  return { restaurants, loading };
}
