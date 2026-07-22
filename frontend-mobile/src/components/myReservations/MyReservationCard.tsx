import React, { useEffect, useState } from "react";
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
  expiresAt?: string | null;
};

type MyReservationCardProps = {
  isCancelling: boolean;
  isPaymentInProgress: boolean;
  isPaying: boolean;
  reservation: ReservationCardItem;
  onCancel: (reservationId: string) => void;
  onPay: (reservationId: string) => void;
  onPress?: () => void;
  onRate?: () => void;
  onReport?: () => void;
  onReorder?: () => void;
};

function getRemainingTime(
  expiresAt: string | null | undefined,
  nowMs: number
) {
  if (!expiresAt) {
    return null;
  }

  const expirationMs = new Date(expiresAt).getTime();

  if (Number.isNaN(expirationMs)) {
    return null;
  }

  const differenceMs = expirationMs - nowMs;

  if (differenceMs <= 0) {
    return {
      expired: true,
      label: "Tiempo agotado",
    };
  }

  const totalSeconds = Math.ceil(differenceMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return {
    expired: false,
    label: `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`,
  };
}

export function MyReservationCard({
  isCancelling,
  isPaymentInProgress,
  isPaying,
  reservation,
  onCancel,
  onPay,
  onPress,
  onRate,
  onReport,
  onReorder,
}: MyReservationCardProps) {
  const badge = getReservationStatusBadge(reservation.status);

  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    if (
      reservation.status !== "pending_payment" ||
      !reservation.expiresAt
    ) {
      return undefined;
    }

    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [reservation.status, reservation.expiresAt]);

  const remainingTime =
    reservation.status === "pending_payment"
      ? getRemainingTime(reservation.expiresAt, nowMs)
      : null;

  const shouldShowActions = reservation.status === "pending_payment" && !remainingTime?.expired;
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
            {remainingTime ? (
              <View style={styles.expirationRow}>
                <MaterialCommunityIcons
                  name="timer-outline"
                  size={15}
                  color={
                    remainingTime.expired
                      ? studentPalette.danger
                      : studentPalette.warning
                  }
                />

                <Text
                  style={[
                    styles.expirationText,
                    remainingTime.expired && styles.expirationTextExpired,
                  ]}
                >
                  {remainingTime.expired
                    ? "Tiempo para pagar agotado"
                    : `Tiempo para pagar: ${remainingTime.label}`}
                </Text>
              </View>
            ) : null}
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

      {onReorder ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver a pedir"
          onPress={onReorder}
          style={({ pressed }) => [
            styles.reorderButton,
            pressed && styles.reorderButtonPressed,
          ]}
        >
          <MaterialCommunityIcons
            name="repeat"
            size={16}
            color={studentPalette.primary}
          />
          <Text style={styles.reorderText}>Volver a pedir</Text>
        </Pressable>
      ) : null}

      {(onRate || onReport) ? (
        <View style={styles.quickActions}>
          {onRate ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Calificar pedido"
              onPress={onRate}
              style={({ pressed }) => [
                styles.quickActionButton,
                pressed && styles.reorderButtonPressed,
              ]}
            >
              <MaterialCommunityIcons
                name="star-outline"
                size={16}
                color={studentPalette.primary}
              />
              <Text style={styles.reorderText}>Calificar pedido</Text>
            </Pressable>
          ) : null}

          {onReport ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Reportar problema"
              onPress={onReport}
              style={({ pressed }) => [
                styles.quickActionButton,
                pressed && styles.reorderButtonPressed,
              ]}
            >
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={16}
                color={studentPalette.primary}
              />
              <Text style={styles.reorderText}>Reportar problema</Text>
            </Pressable>
          ) : null}
        </View>
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
    borderRadius: 20,
    borderColor: studentPalette.border,
    backgroundColor: studentPalette.cardElevated,
    padding: spacing.sm,
    shadowColor: studentPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
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
  expirationRow: {
    marginTop: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  expirationText: {
    flex: 1,
    color: studentPalette.warning,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  expirationTextExpired: {
    color: studentPalette.danger,
  },
  reorderButton: {
    marginTop: spacing.sm,
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderRadius: 999,
    backgroundColor: studentPalette.primaryFaint,
    borderWidth: 1,
    borderColor: studentPalette.primarySoft,
  },
  reorderButtonPressed: {
    opacity: 0.82,
  },
  reorderText: {
    color: studentPalette.primary,
    fontSize: typography.roles.cardTitle.fontSize,
    fontWeight: typography.roles.cardTitle.fontWeight,
  },
  quickActions: {
    marginTop: spacing.sm,
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  quickActionButton: {
    flexGrow: 1,
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 999,
    backgroundColor: studentPalette.primaryFaint,
    borderWidth: 1,
    borderColor: studentPalette.primarySoft,
  },
});
