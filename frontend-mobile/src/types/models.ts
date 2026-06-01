export type UserRole = "student" | "admin";

export type ReservationStatus =
  | "pending_payment"
  | "confirmed"
  | "cancelled"
  | "expired"
  | "completed";

export type Restaurant = {
  id: string | number;
  name: string;
  isActive: boolean;
  location?: string;
  description?: string;
  openingTime?: string;
  closingTime?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Reservation = {
  id: string;
  status: ReservationStatus;
  createdAt: string;
  items: ReservationItem[];
};

export type ReservationItem = {
  id: string;
  dishId: string;
  dishName: string;
  dishDescription?: string | null;
  restaurantId: string;
  unitPrice: number;
};
