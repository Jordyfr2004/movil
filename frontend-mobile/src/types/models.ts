export type UserRole = "student" | "admin" | "super_admin";

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
  imageUrl?: string | null;
  imagePath?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type Reservation = {
  id: string;
  status: ReservationStatus;
  createdAt: string;
  items: ReservationItem[];
  totalAmount?: number;
  deliveredAt?: string | null;
  deliveryStatus?: string;
};

export type ReservationItem = {
  id: string;
  dishId: string;
  dishName: string;
  dishDescription?: string | null;
  restaurantId: string;
  unitPrice: number;
  quantity?: number;
};
