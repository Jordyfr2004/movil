import { restaurantsMock } from "../mocks/restaurants";
import { Restaurant } from "../types/models";

export async function getRestaurants(): Promise<Restaurant[]> {
  return Promise.resolve(restaurantsMock);
}
