import { Menu } from "../types/models";

export const menusMock: Menu[] = [
  {
    id: 1,
    restaurantId: 1,
    menuDate: "2026-04-14",
    title: "Menu tradicional",
    description:
      "Sopa de verduras, arroz con pollo, ensalada fresca y jugo natural.",
    availableQuota: 120,
    reservedQuota: 68,
    isActive: true,
  },
  {
    id: 2,
    restaurantId: 2,
    menuDate: "2026-04-14",
    title: "Menu ejecutivo",
    description: "Crema de zapallo, carne guisada, pure y bebida.",
    availableQuota: 90,
    reservedQuota: 74,
    isActive: true,
  },
  {
    id: 3,
    restaurantId: 3,
    menuDate: "2026-04-14",
    title: "Menu saludable",
    description: "Ensalada de quinoa, pechuga a la plancha y fruta.",
    availableQuota: 60,
    reservedQuota: 60,
    isActive: false,
  },
];
