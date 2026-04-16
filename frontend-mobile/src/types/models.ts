export type UserRole = "student" | "admin";

export type ReservationStatus = "confirmed" | "cancelled";

export type User = {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
};

export type Restaurant = {
  id: number;
  name: string;
  location: string;
  description?: string;
  openingTime: string;
  closingTime: string;
  isActive: boolean;
};

export type Menu = {
  id: number;
  restaurantId: number;
  menuDate: string;
  title: string;
  description: string;
  availableQuota: number;
  reservedQuota: number;
  remainingQuota?: number;
  isActive: boolean;
};

export type Reservation = {
  id: number;
  userId: number;
  menuId: number;
  status: ReservationStatus;
  reservationDate: string;
};
