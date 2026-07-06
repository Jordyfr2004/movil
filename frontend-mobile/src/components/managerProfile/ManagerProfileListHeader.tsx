import React from "react";
import { ManagerDishesHeaderCard } from "./ManagerDishesHeaderCard";
import { ManagerProfileHeader } from "./ManagerProfileHeader";
import { ManagerProfileSummaryCard } from "./ManagerProfileSummaryCard";

type ManagerProfileListHeaderProps = {
  displayName: string;
  displayEmail: string;
  initial: string;
  restaurantName: string;
  isLoadingDishes: boolean;
  dishesCount: number;
  visibleDishesCount: number;
};

export function ManagerProfileListHeader({
  displayName,
  displayEmail,
  initial,
  restaurantName,
  isLoadingDishes,
  dishesCount,
  visibleDishesCount,
}: ManagerProfileListHeaderProps) {
  return (
    <>
      <ManagerProfileHeader />
      <ManagerProfileSummaryCard
        displayName={displayName}
        displayEmail={displayEmail}
        initial={initial}
        restaurantName={restaurantName}
        dishesCount={dishesCount}
        visibleDishesCount={visibleDishesCount}
      />
      <ManagerDishesHeaderCard
        isLoadingDishes={isLoadingDishes}
        dishesCount={dishesCount}
      />
    </>
  );
}
