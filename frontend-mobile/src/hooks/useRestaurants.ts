import { useCallback, useEffect, useState } from "react";
import { Restaurant } from "../types/models";
import { getRestaurants } from "../services/restaurantService";

export function useRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    let isMounted = true;

    setLoading(true);
    setError(null);

    const request = getRestaurants()
      .then((data) => {
        if (isMounted) {
          setRestaurants(data.filter((item) => item.isActive));
          setError(null);
        }
      })
      .catch((reason: unknown) => {
        if (isMounted) {
          setRestaurants([]);
          setError(
            reason instanceof Error
              ? reason.message
              : "No se pudieron cargar los restaurantes"
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return {
      request,
      cleanup: () => {
        isMounted = false;
      },
    };
  }, []);

  useEffect(() => {
    const { cleanup } = reload();

    return cleanup;
  }, [reload]);

  return { restaurants, loading, error, reload: () => reload().request };
}
