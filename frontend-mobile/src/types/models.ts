export type UserRole = "student" | "admin";

export type ReservationStatus = "confirmed" | "cancelled";

export type User = {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
};

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

export type Menu = {
  id: number;
  restaurantId: string | number;
  menuDate: string;
  title: string;
  description: string;
  availableQuota: number;
  reservedQuota: number;
  remainingQuota?: number;
  isActive: boolean;
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
