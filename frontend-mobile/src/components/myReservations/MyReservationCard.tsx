import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { spacing } from "../../constants/spacing";
import type { ReservationStatus } from "../../types/models";
import { colors, typography } from "../../theme";
import { formatReservationDate } from "../../utils/date";
import { Card } from "../Card";
import { StatusBadge } from "../StatusBadge";
import { MyReservationActions } from "./MyReservationActions";
import { getReservationStatusBadge } from "./getReservationStatusBadge";

type ReservationCardItem = {
  id: string;
  reservationDate: string;
  restaurantName: string;
  status: ReservationStatus;
  title: string;
};

type MyReservationCardProps = {
  isCancelling: boolean;
  isPaymentInProgress: boolean;
  isPaying: boolean;
  reservation: ReservationCardItem;
  onCancel: (reservationId: string) => void;
  onPay: (reservationId: string) => void;
};

export function MyReservationCard({
  isCancelling,
  isPaymentInProgress,
  isPaying,
  reservation,
  onCancel,
  onPay,
}: MyReservationCardProps) {
  const badge = getReservationStatusBadge(reservation.status);
  const shouldShowActions = reservation.status === "pending_payment";

  return (
    <Card>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {reservation.title}
        </Text>
        <StatusBadge label={badge.label} tone={badge.tone} />
      </View>

      <Text style={styles.cardSubtitle} numberOfLines={1}>
        {reservation.restaurantName}
      </Text>
      <Text style={styles.cardDate}>
        {formatReservationDate(reservation.reservationDate)}
      </Text>

      {shouldShowActions ? (
        <MyReservationActions
          isCancelling={isCancelling}
          isPaying={isPaying}
          isPaymentInProgress={isPaymentInProgress}
          reservationTitle={reservation.title}
          onCancel={() => onCancel(reservation.id)}
          onPay={() => onPay(reservation.id)}
        />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeights.md,
  },
  cardSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  cardDate: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
});
