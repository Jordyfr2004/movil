import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { spacing } from "../../constants/spacing";
import type { ReservationStatus } from "../../types/models";
import { typography } from "../../theme";
import { studentPalette } from "../../theme/studentPalette";
import { formatReservationDate } from "../../utils/date";
import { Card } from "../Card";
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
  const isActive =
    reservation.status === "confirmed" ||
    reservation.status === "pending_payment";
  const isCancelled =
    reservation.status === "cancelled" || reservation.status === "expired";

  return (
    <Card
      style={[
        styles.card,
        isActive && styles.cardActive,
        isCancelled && styles.cardCancelled,
      ]}
    >
      <View
        style={[
          styles.stateBar,
          isCancelled
            ? styles.stateBarCancelled
            : isActive
              ? styles.stateBarActive
              : styles.stateBarNeutral,
        ]}
        pointerEvents="none"
      />

      <View style={styles.cardHeader}>
        <Text style={styles.eyebrow}>RESERVA</Text>

        <View
          style={[
            styles.badge,
            badge.tone === "success"
              ? styles.badgeSuccess
              : styles.badgeDanger,
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              badge.tone === "success"
                ? styles.badgeTextSuccess
                : styles.badgeTextDanger,
            ]}
          >
            {badge.label}
          </Text>
        </View>
      </View>

      <View style={styles.titleGroup}>
        <View style={[styles.icon, isCancelled && styles.iconCancelled]}>
          <MaterialCommunityIcons
            name="silverware"
            size={19}
            color={
              isCancelled ? studentPalette.danger : studentPalette.primary
            }
          />
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {reservation.title}
        </Text>
      </View>

      <View
        style={[styles.metaBlock, isCancelled && styles.metaBlockCancelled]}
      >
        <View style={styles.metaRow}>
          <MaterialCommunityIcons
            name="storefront-outline"
            size={17}
            color={studentPalette.primary}
          />
          <Text style={styles.cardSubtitle} numberOfLines={2}>
            {reservation.restaurantName}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <MaterialCommunityIcons
            name="calendar-blank-outline"
            size={17}
            color={studentPalette.primary}
          />
          <Text style={styles.cardDate}>
            {formatReservationDate(reservation.reservationDate)}
          </Text>
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
  );
}

const styles = StyleSheet.create({
  card: {
    position: "relative",
    borderRadius: 20,
    borderColor: studentPalette.border,
    backgroundColor: studentPalette.card,
    shadowColor: studentPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 2,
    overflow: "hidden",
  },
  cardActive: {
    borderColor: studentPalette.primarySoft,
  },
  cardCancelled: {
    borderColor: "rgba(214, 69, 80, 0.22)",
    backgroundColor: "#FFFCFC",
  },
  stateBar: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: 4,
  },
  stateBarActive: {
    backgroundColor: studentPalette.primary,
  },
  stateBarCancelled: {
    backgroundColor: studentPalette.danger,
  },
  stateBarNeutral: {
    backgroundColor: studentPalette.border,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  eyebrow: {
    flex: 1,
    fontSize: 10,
    color: studentPalette.textMuted,
    fontWeight: typography.weights.bold,
    letterSpacing: 1.1,
    lineHeight: 14,
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: studentPalette.primaryPale,
    borderWidth: 1,
    borderColor: studentPalette.border,
  },
  iconCancelled: {
    backgroundColor: studentPalette.dangerSoft,
    borderColor: "rgba(214, 69, 80, 0.16)",
  },
  cardTitle: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: studentPalette.textPrimary,
    lineHeight: typography.lineHeights.md,
  },
  badge: {
    maxWidth: 136,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderWidth: 1,
  },
  badgeSuccess: {
    backgroundColor: studentPalette.successSoft,
    borderColor: "rgba(46, 125, 79, 0.18)",
  },
  badgeDanger: {
    backgroundColor: studentPalette.dangerSoft,
    borderColor: "rgba(214, 69, 80, 0.18)",
  },
  badgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
    textAlign: "center",
  },
  badgeTextSuccess: {
    color: studentPalette.success,
  },
  badgeTextDanger: {
    color: studentPalette.danger,
  },
  metaBlock: {
    marginTop: spacing.md,
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: studentPalette.primaryPale,
  },
  metaBlockCancelled: {
    backgroundColor: "#FAF4F1",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  cardSubtitle: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: studentPalette.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
  cardDate: {
    fontSize: typography.sizes.sm,
    color: studentPalette.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
});
