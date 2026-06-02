import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import { EmptyState } from "../EmptyState";
import { ErrorMessage } from "../ErrorMessage";
import { LoadingState } from "../LoadingState";

type ManagerDishesFeedbackProps = {
  isLoadingDishes: boolean;
  dishesError: string | null;
  onRetry: () => void;
  style?: StyleProp<ViewStyle>;
};

export function ManagerDishesFeedback({
  isLoadingDishes,
  dishesError,
  onRetry,
  style,
}: ManagerDishesFeedbackProps) {
  if (isLoadingDishes) {
    return <LoadingState message="Cargando tus platos…" style={style} />;
  }

  if (dishesError) {
    return (
      <ErrorMessage
        title="No se pudieron cargar los platos"
        message={dishesError}
        onRetry={onRetry}
        style={style}
      />
    );
  }

  return (
    <EmptyState
      title="Sin platos"
      message='Pulsa "Añadir platos" para crear tu primer plato.'
      iconName="food-outline"
      style={style}
    />
  );
}
