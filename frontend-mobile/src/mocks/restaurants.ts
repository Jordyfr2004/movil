import { Restaurant } from "../types/models";

export const restaurantsMock: Restaurant[] = [
  {
    id: 1,
    name: "Comedor Central",
    location: "Campus Matriz",
    description: "Menu balanceado y opciones vegetarianas.",
    openingTime: "07:30",
    closingTime: "15:30",
    isActive: true,
  },
  {
    id: 2,
    name: "Comedor Norte",
    location: "Facultad de Ingenieria",
    description: "Atencion rapida para estudiantes entre clases.",
    openingTime: "08:00",
    closingTime: "14:30",
    isActive: true,
  },
  {
    id: 3,
    name: "Punto Verde",
    location: "Bloque Administrativo",
    description: "Opciones saludables y snacks.",
    openingTime: "09:00",
    closingTime: "17:00",
    isActive: false,
  },
];
