import { spacing } from "../../constants/spacing";
import { studentPalette } from "../../theme/studentPalette";

export const managerPalette = studentPalette;
export const MANAGER_AVATAR_SIZE = 60;
export const MANAGER_AVATAR_RADIUS = 20;
export const MANAGER_DISHES_CARD_MARGIN_TOP = spacing.lg;
export const MANAGER_ROLE_LABEL = "Encargado";

export function getManagerDishesSubtitle(
  isLoadingDishes: boolean,
  dishesCount: number
) {
  if (isLoadingDishes) {
    return "Cargando tus platos...";
  }

  if (dishesCount > 0) {
    return `Tienes ${dishesCount} plato${dishesCount === 1 ? "" : "s"}.`;
  }

  return "Aún no has añadido platos.";
}
