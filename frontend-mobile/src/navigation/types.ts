import { NavigatorScreenParams } from "@react-navigation/native";

import { Dish } from "../services/dishService";
import { Restaurant } from "../types/models";
import { ROUTES } from "./routes";

export type RootStackParamList = {
  [ROUTES.Welcome]: undefined;
  [ROUTES.StudentAccess]: undefined;
  [ROUTES.Login]: undefined;
  [ROUTES.CreateRestaurant]: undefined;
  [ROUTES.ManagerProfile]: undefined;
  [ROUTES.AddDish]:
    | {
        dish?: Pick<Dish, "id" | "name" | "price" | "description">;
      }
    | undefined;
  [ROUTES.Home]: undefined;
  [ROUTES.RestaurantDetail]: { restaurant: Restaurant };
  [ROUTES.MyReservations]: undefined;
  [ROUTES.Profile]: undefined;
  [ROUTES.Register]: undefined;
};

export type StudentStackParamList = Pick<
  RootStackParamList,
  | typeof ROUTES.Home
  | typeof ROUTES.RestaurantDetail
  | typeof ROUTES.MyReservations
  | typeof ROUTES.Profile
>;

export type StudentDrawerParamList = {
  StudentStack: NavigatorScreenParams<StudentStackParamList>;
};

export type AdminStackParamList = Pick<
  RootStackParamList,
  typeof ROUTES.ManagerProfile | typeof ROUTES.AddDish
>;

export type AdminDrawerParamList = {
  AdminStack: NavigatorScreenParams<AdminStackParamList>;
};
