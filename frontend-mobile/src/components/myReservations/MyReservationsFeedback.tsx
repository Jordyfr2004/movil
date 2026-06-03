import React from "react";
import { StyleProp, ViewStyle } from "react-native";

import { EmptyState } from "../EmptyState";
import { ErrorMessage } from "../ErrorMessage";
import { LoadingState } from "../LoadingState";

type MyReservationsFeedbackProps = {
  error: string | null;
  loading: boolean;
  onRetry: () => void;
  style?: StyleProp<ViewStyle>;
};

export function MyReservationsFeedback({
  error,
  loading,
  onRetry,
  style,
}: MyReservationsFeedbackProps) {
  if (loading) {
    return (
      <LoadingState
        message="Espera un momento mientras actualizamos la información."
        style={style}
      />
    );
  }

  if (error) {
    return (
      <ErrorMessage
        title="No se pudieron cargar las reservas"
        message={error}
        onRetry={onRetry}
        style={style}
      />
    );
  }

  return (
    <EmptyState
      title="Aún no tienes reservas"
      message="Cuando reserves platos, aparecerán aquí."
      iconName="calendar-blank-outline"
      style={style}
    />
  );
}
