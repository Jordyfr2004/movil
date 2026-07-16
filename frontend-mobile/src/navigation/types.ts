import { NavigatorScreenParams } from "@react-navigation/native";

import { Dish } from "../services/dishService";
import { Reservation, Restaurant } from "../types/models";
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
  [ROUTES.FoodDetail]: { restaurant: Restaurant; dish: Dish };
  [ROUTES.Cart]: undefined;
  [ROUTES.Checkout]: undefined;
  [ROUTES.ReservationTracking]: { reservation: Reservation };
  [ROUTES.ManagerQrScanner]: undefined;
  [ROUTES.Notifications]: undefined;
  [ROUTES.Appearance]: undefined;
  [ROUTES.Rating]: { reservation: Reservation };
  [ROUTES.ProblemReport]: { reservationId?: string } | undefined;
  [ROUTES.Help]: undefined;
  [ROUTES.LocalPending]: undefined;
  [ROUTES.OnboardingReview]: undefined;
  [ROUTES.OnboardingStageDetail]: { index: number };
  [ROUTES.OnboardingFull]: undefined;
  [ROUTES.HelpDetail]: {
    topic: "cart" | "access" | "payments" | "reservations" | "qr";
  };
  [ROUTES.PendingDetail]: { kind: "rating" | "report"; id: string };
  [ROUTES.MyReservations]: undefined;
  [ROUTES.Profile]: undefined;
  [ROUTES.Register]: undefined;
  [ROUTES.SuperAdmin]: undefined;

  [ROUTES.SuperAdminRestaurants]:
  undefined;

  [ROUTES.SuperAdminUsers]:
    undefined;

  [ROUTES.SuperAdminAssignManager]:
    undefined;

  [ROUTES.SuperAdminUserRole]:
    undefined;

  [ROUTES.SuperAdminUserStatus]:
    undefined;
};

export type StudentStackParamList = Pick<
  RootStackParamList,
  | typeof ROUTES.Home
  | typeof ROUTES.RestaurantDetail
  | typeof ROUTES.FoodDetail
  | typeof ROUTES.Cart
  | typeof ROUTES.Checkout
  | typeof ROUTES.ReservationTracking
  | typeof ROUTES.Notifications
  | typeof ROUTES.Appearance
  | typeof ROUTES.Rating
  | typeof ROUTES.ProblemReport
  | typeof ROUTES.Help
  | typeof ROUTES.LocalPending
  | typeof ROUTES.OnboardingReview
  | typeof ROUTES.OnboardingStageDetail
  | typeof ROUTES.OnboardingFull
  | typeof ROUTES.HelpDetail
  | typeof ROUTES.PendingDetail
  | typeof ROUTES.MyReservations
  | typeof ROUTES.Profile
>;

export type StudentDrawerParamList = {
  StudentStack: NavigatorScreenParams<StudentStackParamList>;
};

export type AdminStackParamList = Pick<
  RootStackParamList,
  typeof ROUTES.ManagerProfile | typeof ROUTES.AddDish | typeof ROUTES.ManagerQrScanner
>;

export type AdminDrawerParamList = {
  AdminStack: NavigatorScreenParams<AdminStackParamList>;
};
