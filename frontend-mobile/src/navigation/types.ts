import { ROUTES } from "./routes";
import { Restaurant } from "../types/models";

export type RootStackParamList = {
  [ROUTES.Welcome]: undefined;
  [ROUTES.Login]: undefined;
  [ROUTES.Home]: undefined;
  [ROUTES.RestaurantDetail]: { restaurant: Restaurant };
  [ROUTES.Menu]: { restaurantId: number; restaurantName: string };
  [ROUTES.MyReservations]: { userId: number };
  [ROUTES.Profile]: undefined;
};
