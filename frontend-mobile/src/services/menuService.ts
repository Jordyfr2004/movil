import { menusMock } from "../mocks/menus";
import { Menu } from "../types/models";

export async function getMenuByRestaurant(
  restaurantId: number
): Promise<Menu | null> {
  const activeMenu = menusMock.find(
    (menu) => menu.restaurantId === restaurantId && menu.isActive
  );

  return Promise.resolve(activeMenu ?? null);
}
