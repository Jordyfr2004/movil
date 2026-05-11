import { menusMock } from "../mocks/menus";
import { Menu } from "../types/models";

export async function getMenuByRestaurant(
  restaurantId: string | number
): Promise<Menu | null> {
  const activeMenu = menusMock.find(
    (menu) => String(menu.restaurantId) === String(restaurantId) && menu.isActive
  );

  return Promise.resolve(activeMenu ?? null);
}
