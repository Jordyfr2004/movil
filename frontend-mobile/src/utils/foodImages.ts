import { ImageSourcePropType } from "react-native";

import type { Restaurant } from "../types/models";

type DishLike = {
  id?: string | number;
  name?: string;
  imageUrl?: string | null;
};

const FOOD_FALLBACK_IMAGES = [
  require("../assets/images/home_food_fallback.png") as ImageSourcePropType,
  require("../assets/images/home_food_healthy_lunch.png") as ImageSourcePropType,
  require("../assets/images/home_food_cafeteria.png") as ImageSourcePropType,
  require("../assets/images/home_food_snacks.png") as ImageSourcePropType,
] as const;

const RESTAURANT_IMAGE_BY_ID: Record<string, ImageSourcePropType> = {};

const DISH_IMAGE_BY_KEYWORD: Array<{
  keywords: string[];
  image: ImageSourcePropType;
}> = [
  {
    keywords: ["sopa", "fideo", "caldo", "consome", "encebollado"],
    image: FOOD_FALLBACK_IMAGES[2],
  },
  {
    keywords: [
      "arroz con pollo",
      "arroz",
      "pollo",
      "chaufalan",
      "chaufa",
      "seco",
      "menestra",
      "apanado",
      "papipollo",
    ],
    image: FOOD_FALLBACK_IMAGES[0],
  },
  {
    keywords: ["fritada", "cerdo", "chancho", "carne", "chuleta"],
    image: FOOD_FALLBACK_IMAGES[3],
  },
  {
    keywords: ["ceviche", "camaron", "camarón", "pescado", "marisco"],
    image: FOOD_FALLBACK_IMAGES[1],
  },
  {
    keywords: ["hamburguesa", "burger", "sanduche", "sandwich"],
    image: FOOD_FALLBACK_IMAGES[3],
  },
  {
    keywords: ["lasana", "lasagna", "lasaña", "pasta", "tallarin", "tallarín"],
    image: FOOD_FALLBACK_IMAGES[2],
  },
];

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
    hash = (hash * 31 + key.charCodeAt(index)) % FOOD_FALLBACK_IMAGES.length;
  }

  return Math.abs(hash) % FOOD_FALLBACK_IMAGES.length;
}

function getRestaurantImageKey(restaurant?: Pick<Restaurant, "id" | "name"> | null) {
  return normalizeImageKey(restaurant?.id) || normalizeImageKey(restaurant?.name);
}

function getDishKeywordImage(dish?: DishLike | null) {
  const name = normalizeImageKey(dish?.name);
  if (!name) return undefined;

  return DISH_IMAGE_BY_KEYWORD.find((entry) =>
    entry.keywords.some((keyword) => name.includes(normalizeImageKey(keyword)))
  )?.image;
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

  return FOOD_FALLBACK_IMAGES[stableFallbackIndex(key || "restaurant-fallback")];
}

export function getDishImageSource(
  dish?: DishLike | null,
  _restaurant?: Pick<Restaurant, "id" | "name"> | null
): ImageSourcePropType {
  if (dish?.imageUrl) {
    return { uri: dish.imageUrl };
  }

  const keywordImage = getDishKeywordImage(dish);
  if (keywordImage) return keywordImage;

  const key = [normalizeImageKey(dish?.id), normalizeImageKey(dish?.name)]
    .filter(Boolean)
    .join("-");

  return FOOD_FALLBACK_IMAGES[stableFallbackIndex(key || "dish-fallback", 2)];
}
