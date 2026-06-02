import { spacing } from "../../constants/spacing";

export const MANAGER_AVATAR_SIZE = 44;
export const MANAGER_AVATAR_RADIUS = 14;
export const MANAGER_DISHES_CARD_MARGIN_TOP = spacing.lg;
export const MANAGER_ROLE_LABEL = "Manager";

export function getManagerDishesSubtitle(
  isLoadingDishes: boolean,
  dishesCount: number
) {
  if (isLoadingDishes) {
    return "Cargando tus platos…";
  }

  if (dishesCount > 0) {
    return `Tienes ${dishesCount} plato${dishesCount === 1 ? "" : "s"}.`;
  }

  return "Aún no has añadido platos.";
}
