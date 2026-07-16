import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { spacing } from "../../constants/spacing";
import type { ReservationStatus } from "../../types/models";
import { typography } from "../../theme";
import { studentPalette } from "../../theme/studentPalette";
import { formatReservationDate } from "../../utils/date";
import { Card } from "../Card";
import { StudentStatusPill } from "../StudentStatusPill";
import { StudentVisualPlaceholder } from "../StudentVisualPlaceholder";
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
  onPress?: () => void;
};

export function MyReservationCard({
  isCancelling,
  isPaymentInProgress,
  isPaying,
  reservation,
  onCancel,
  onPay,
  onPress,
}: MyReservationCardProps) {
  const badge = getReservationStatusBadge(reservation.status);
  const shouldShowActions = reservation.status === "pending_payment";
  const statusStyle = getStatusStyle(reservation.status);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver reserva ${reservation.title}`}
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
    <Card style={[styles.card, statusStyle.card]}>
      <View style={[styles.stateMark, statusStyle.mark]} pointerEvents="none" />

      <View style={styles.mainRow}>
        <StudentVisualPlaceholder
          iconName={statusStyle.iconName}
          label={`Reserva ${reservation.title}`}
          size="sm"
          style={styles.visual}
          variant={reservation.status === "pending_payment" ? "reservation" : "dish"}
        />

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {reservation.title}
            </Text>
            <StudentStatusPill
              label={badge.label}
              style={styles.statusPill}
              tone={badge.tone}
            />
          </View>

          <Text style={styles.restaurantName} numberOfLines={1}>
            {reservation.restaurantName}
          </Text>

          <View style={styles.metaRow}>
            <MaterialCommunityIcons
              name="calendar-blank-outline"
              size={15}
              color={studentPalette.textMuted}
            />
            <Text style={styles.cardDate} numberOfLines={1}>
              {formatReservationDate(reservation.reservationDate)}
            </Text>
          </View>
        </View>
      </View>

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
    </Pressable>
  );
}

function getStatusStyle(status: ReservationStatus) {
  switch (status) {
    case "confirmed":
      return {
        card: styles.cardConfirmed,
        mark: styles.markConfirmed,
        iconName: "check-circle-outline" as const,
      };
    case "pending_payment":
      return {
        card: styles.cardPending,
        mark: styles.markPending,
        iconName: "clock-outline" as const,
      };
    case "completed":
      return {
        card: styles.cardCompleted,
        mark: styles.markCompleted,
        iconName: "calendar-check-outline" as const,
      };
    case "expired":
    case "cancelled":
    default:
      return {
        card: styles.cardCancelled,
        mark: styles.markCancelled,
        iconName: "close-circle-outline" as const,
      };
  }
}

const styles = StyleSheet.create({
  card: {
    position: "relative",
    borderRadius: 16,
    borderColor: studentPalette.border,
    backgroundColor: studentPalette.card,
    padding: spacing.sm,
    shadowColor: studentPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
    overflow: "hidden",
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
  cardPending: {
    borderColor: studentPalette.warningBorder,
  },
  cardConfirmed: {
    borderColor: "rgba(35, 148, 71, 0.24)",
  },
  cardCancelled: {
    borderColor: "rgba(214, 40, 40, 0.18)",
  },
  cardCompleted: {
    borderColor: "rgba(70, 98, 122, 0.20)",
  },
  stateMark: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 2,
  },
  markPending: {
    backgroundColor: "rgba(217, 119, 6, 0.56)",
  },
  markConfirmed: {
    backgroundColor: "rgba(35, 148, 71, 0.42)",
  },
  markCancelled: {
    backgroundColor: "rgba(214, 40, 40, 0.34)",
  },
  markCompleted: {
    backgroundColor: "rgba(70, 98, 122, 0.34)",
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  visual: {
    width: 50,
    height: 50,
    borderRadius: 14,
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  cardTitle: {
    flex: 1,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: studentPalette.textPrimary,
    lineHeight: typography.lineHeights.sm,
  },
  statusPill: {
    maxWidth: 132,
  },
  restaurantName: {
    fontSize: typography.sizes.xs,
    color: studentPalette.textSecondary,
    lineHeight: typography.lineHeights.xs,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  cardDate: {
    flex: 1,
    fontSize: typography.sizes.xs,
    color: studentPalette.textMuted,
    lineHeight: typography.lineHeights.xs,
  },
});
