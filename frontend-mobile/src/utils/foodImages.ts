import { ImageSourcePropType } from "react-native";

import type { Restaurant } from "../types/models";

type DishLike = {
  id?: string | number;
  name?: string;
  imageUrl?: string | null;
};

const RESTAURANT_FALLBACK_IMAGES = [
  require("../assets/images/home_food_fallback.png") as ImageSourcePropType,
  require("../assets/images/home_food_healthy_lunch.png") as ImageSourcePropType,
  require("../assets/images/home_food_cafeteria.png") as ImageSourcePropType,
  require("../assets/images/home_food_snacks.png") as ImageSourcePropType,
] as const;

const RESTAURANT_IMAGE_BY_ID: Record<string, ImageSourcePropType> = {};

function normalizeImageKey(value?: string | number | null) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function stableFallbackIndex(key: string, offset = 0) {
  let hash = 17 + offset;

  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) % RESTAURANT_FALLBACK_IMAGES.length;
  }

  return Math.abs(hash) % RESTAURANT_FALLBACK_IMAGES.length;
}

function getRestaurantImageKey(restaurant?: Pick<Restaurant, "id" | "name"> | null) {
  return normalizeImageKey(restaurant?.id) || normalizeImageKey(restaurant?.name);
}

export function getRestaurantImageSource(
  restaurant?: Pick<Restaurant, "id" | "name" | "imageUrl"> | null
): ImageSourcePropType {
  if (restaurant?.imageUrl) {
    return { uri: restaurant.imageUrl };
  }

  const key = getRestaurantImageKey(restaurant);
  const explicit = key ? RESTAURANT_IMAGE_BY_ID[key] : undefined;
  if (explicit) return explicit;

  return RESTAURANT_FALLBACK_IMAGES[
    stableFallbackIndex(key || "restaurant-fallback")
  ];
}

export function getDishImageSource(
  dish?: DishLike | null,
  restaurant?: Pick<Restaurant, "id" | "name"> | null
): ImageSourcePropType {
  if (dish?.imageUrl) {
    return { uri: dish.imageUrl };
  }

  const key = [
    normalizeImageKey(dish?.id),
    normalizeImageKey(dish?.name),
    getRestaurantImageKey(restaurant),
  ]
    .filter(Boolean)
    .join("-");

  return RESTAURANT_FALLBACK_IMAGES[
    stableFallbackIndex(key || "dish-fallback", 2)
  ];
}
