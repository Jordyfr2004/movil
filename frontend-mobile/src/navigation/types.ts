import { ROUTES } from "./routes";
import { Restaurant } from "../types/models";
import { Dish } from "../services/dishService";

export type RootStackParamList = {
  [ROUTES.Welcome]: undefined;
  [ROUTES.StudentAccess]: undefined;
  [ROUTES.Login]: undefined;
  [ROUTES.CreateRestaurant]: undefined;
  [ROUTES.ManagerProfile]: undefined;
  [ROUTES.AddDish]: { dish?: Pick<Dish, "id" | "name" | "price"> } | undefined;
  [ROUTES.Home]: undefined;
  [ROUTES.Evidence]: undefined;
  [ROUTES.RestaurantDetail]: { restaurant: Restaurant };
  [ROUTES.MyReservations]: { userId: number };
  [ROUTES.Profile]: undefined;
  [ROUTES.SensorMovimiento]: undefined;
};
