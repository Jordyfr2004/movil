import React from "react";
import { ManagerDishesHeaderCard } from "./ManagerDishesHeaderCard";
import { ManagerProfileHeader } from "./ManagerProfileHeader";
import { ManagerProfileSummaryCard } from "./ManagerProfileSummaryCard";

type ManagerProfileListHeaderProps = {
  displayName: string;
  displayEmail: string;
  initial: string;
  restaurantName: string;
  isLoggingOut: boolean;
  isLoadingDishes: boolean;
  dishesCount: number;
  onAddDishPress: () => void;
  onLogoutPress: () => void;
};

export function ManagerProfileListHeader({
  displayName,
  displayEmail,
  initial,
  restaurantName,
  isLoggingOut,
  isLoadingDishes,
  dishesCount,
  onAddDishPress,
  onLogoutPress,
}: ManagerProfileListHeaderProps) {
  return (
    <>
      <ManagerProfileHeader />
      <ManagerProfileSummaryCard
        displayName={displayName}
        displayEmail={displayEmail}
        initial={initial}
        restaurantName={restaurantName}
        isLoggingOut={isLoggingOut}
        onAddDishPress={onAddDishPress}
        onLogoutPress={onLogoutPress}
      />
      <ManagerDishesHeaderCard
        isLoadingDishes={isLoadingDishes}
        dishesCount={dishesCount}
      />
    </>
  );
}
