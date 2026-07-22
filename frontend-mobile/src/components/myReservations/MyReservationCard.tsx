import React, { useEffect, useRef, useState } from "react";
import { Animated, ImageSourcePropType, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useReduceMotion } from "../../hooks/useReduceMotion";
import { designSystem, typography } from "../../theme";
import { studentPalette } from "../../theme/studentPalette";
import type { ReservationStatus } from "../../types/models";
import { getDishImageSource, getRestaurantImageSource } from "../../utils/foodImages";
import { triggerFeedback } from "../../utils/haptics";
import { getReservationStatusBadge } from "./getReservationStatusBadge";

type ReservationCardItem = {
  id: string;
  dishImageUrl?: string | null;
  reservationDate: string;
  restaurantImageUrl?: string | null;
  restaurantName: string;
  status: ReservationStatus;
  title: string;
  expiresAt?: string | null;
  items?: Array<{
    dishId: string;
    dishImageUrl?: string | null;
    dishName: string;
    restaurantId: string;
    quantity?: number;
  }>;
};

type MyReservationCardProps = {
  isCancelling: boolean;
  isPaymentInProgress: boolean;
  isPaying: boolean;
  isRated?: boolean;
  isReordering?: boolean;
  reservation: ReservationCardItem;
  onCancel: (reservationId: string) => void;
  onPay: (reservationId: string) => void;
  onPress?: () => void;
  onRate?: () => void;
  onReport?: () => void;
  onReorder?: () => void;
};

const LOWERCASE_WORDS = new Set([
  "a",
  "al",
  "con",
  "de",
  "del",
  "el",
  "en",
  "la",
  "las",
  "los",
  "y",
  "arroz",
  "camaron",
  "camarón",
  "carne",
  "cerdo",
  "fideo",
  "pollo",
  "principal",
  "sopa",
]);

function getRemainingTime(expiresAt: string | null | undefined, nowMs: number) {
  if (!expiresAt) return null;

  const expirationMs = new Date(expiresAt).getTime();
  if (Number.isNaN(expirationMs)) return null;

  const differenceMs = expirationMs - nowMs;
  if (differenceMs <= 0) {
    return { expired: true, label: "Tiempo agotado" };
  }

  const totalSeconds = Math.ceil(differenceMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return {
    expired: false,
    label: `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
  };
}

function formatNaturalName(value?: string | null) {
  const raw = value?.trim();
  if (!raw) return "";

  return raw
    .split(/\s+/)
    .map((part, index) => {
      if (/^[A-ZÁÉÍÓÚÜÑ0-9]{2,}$/.test(part) && part.length <= 4) {
        return part;
      }

      const lower = part.toLocaleLowerCase("es-EC");
      if (index > 0 && LOWERCASE_WORDS.has(lower)) return lower;

      return `${lower.charAt(0).toLocaleUpperCase("es-EC")}${lower.slice(1)}`;
    })
    .join(" ");
}

function formatReservationDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const datePart = date
    .toLocaleDateString("es-EC", {
      day: "2-digit",
      month: "short",
      timeZone: "America/Guayaquil",
    })
    .replace(".", "");
  const timePart = date.toLocaleTimeString("es-EC", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Guayaquil",
  });

  return `${datePart} · ${timePart}`;
}

function getReservationTitle(reservation: ReservationCardItem) {
  const firstItem = reservation.items?.[0];
  const baseTitle = firstItem?.dishName || reservation.title || "Reserva";
  const extraCount = Math.max((reservation.items?.length ?? 0) - 1, 0);

  if (extraCount > 0) {
    return `${formatNaturalName(baseTitle)} +${extraCount} ${
      extraCount === 1 ? "producto" : "productos"
    }`;
  }

  return formatNaturalName(baseTitle);
}

function getStatusTone(status: ReservationStatus) {
  if (status === "completed") return "completed";
  if (status === "cancelled" || status === "expired") return "cancelled";
  if (status === "pending_payment") return "pending";
  return "active";
}

function getToneStyles(status: ReservationStatus) {
  switch (getStatusTone(status)) {
    case "completed":
      return {
        line: styles.lineCompleted,
        badge: styles.badgeCompleted,
        badgeText: styles.badgeTextCompleted,
        primaryIcon: "repeat" as const,
      };
    case "cancelled":
      return {
        line: styles.lineCancelled,
        badge: styles.badgeCancelled,
        badgeText: styles.badgeTextCancelled,
        primaryIcon: "repeat" as const,
      };
    case "pending":
      return {
        line: styles.linePending,
        badge: styles.badgePending,
        badgeText: styles.badgeTextPending,
        primaryIcon: "credit-card-outline" as const,
      };
    case "active":
    default:
      return {
        line: styles.lineActive,
        badge: styles.badgeActive,
        badgeText: styles.badgeTextActive,
        primaryIcon: "map-marker-path" as const,
      };
  }
}

function ReservationImage({
  compact = false,
  reservation,
}: {
  compact?: boolean;
  reservation: ReservationCardItem;
}) {
  const reduceMotion = useReduceMotion();
  const firstItem = reservation.items?.[0];
  const opacity = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const dishName = firstItem?.dishName?.trim() || reservation.title?.trim();
  const dishId = firstItem?.dishId ? String(firstItem.dishId) : "";
  const hasDishIdentity = Boolean(dishId || dishName);
  const source: ImageSourcePropType = firstItem?.dishImageUrl
    ? getDishImageSource({
        id: dishId || reservation.id,
        imageUrl: firstItem.dishImageUrl,
        name: dishName,
      })
    : hasDishIdentity
      ? getDishImageSource({
          id: dishId || reservation.id,
          name: dishName,
        })
      : reservation.restaurantImageUrl
        ? getRestaurantImageSource({
            id: firstItem?.restaurantId ?? reservation.restaurantName,
            name: reservation.restaurantName,
            imageUrl: reservation.restaurantImageUrl,
          })
        : getRestaurantImageSource({
            id: firstItem?.restaurantId ?? reservation.restaurantName,
            name: reservation.restaurantName,
          });

  const handleLoad = () => {
    if (reduceMotion) {
      opacity.setValue(1);
      return;
    }

    Animated.timing(opacity, {
      toValue: 1,
      duration: designSystem.animation.fast,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={[styles.imageFrame, compact && styles.imageFrameCompact]}>
      <Animated.Image
        source={source}
        resizeMode="cover"
        onLoad={handleLoad}
        style={[styles.image, { opacity }]}
      />
    </View>
  );
}

function ReservationAction({
  compact = false,
  danger = false,
  disabled,
  fullWidth = false,
  iconName,
  label,
  onPress,
  primary = false,
  quietPrimary = false,
  tertiary = false,
}: {
  compact?: boolean;
  danger?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  onPress?: () => void;
  primary?: boolean;
  quietPrimary?: boolean;
  tertiary?: boolean;
}) {
  const pressLockRef = useRef(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled || !onPress}
      onPress={() => {
        if (pressLockRef.current) return;

        pressLockRef.current = true;
        setTimeout(() => {
          pressLockRef.current = false;
        }, 650);
        void triggerFeedback("selection");
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.actionButton,
        compact && styles.actionButtonCompact,
        primary ? styles.primaryAction : styles.secondaryAction,
        quietPrimary && styles.quietPrimaryAction,
        tertiary && styles.tertiaryAction,
        danger && !primary && styles.dangerAction,
        fullWidth && styles.fullWidthAction,
        pressed && !disabled && styles.actionPressed,
        disabled && styles.actionDisabled,
      ]}
    >
      <MaterialCommunityIcons
        name={iconName}
        size={compact || tertiary ? 13 : 15}
        color={
          primary
            ? quietPrimary
              ? studentPalette.primary
              : "#FFFFFF"
            : danger
              ? studentPalette.danger
              : studentPalette.primary
        }
      />
      <Text
        style={[
          styles.actionText,
          compact && styles.actionTextCompact,
          primary ? styles.primaryActionText : styles.secondaryActionText,
          quietPrimary && styles.quietPrimaryActionText,
          danger && !primary && styles.dangerActionText,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function MyReservationCard({
  isCancelling,
  isPaymentInProgress,
  isPaying,
  isRated = false,
  isReordering = false,
  reservation,
  onCancel,
  onPay,
  onPress,
  onRate,
  onReport,
  onReorder,
}: MyReservationCardProps) {
  const badge = getReservationStatusBadge(reservation.status);
  const tone = getToneStyles(reservation.status);
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    if (reservation.status !== "pending_payment" || !reservation.expiresAt) {
      return undefined;
    }

    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [reservation.status, reservation.expiresAt]);

  const remainingTime =
    reservation.status === "pending_payment"
      ? getRemainingTime(reservation.expiresAt, nowMs)
      : null;
  const canPay = reservation.status === "pending_payment" && !remainingTime?.expired;
  const isActive =
    reservation.status === "confirmed" || reservation.status === "pending_payment";
  const isCompleted = reservation.status === "completed";
  const isCancelled =
    reservation.status === "cancelled" || reservation.status === "expired";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver reserva ${reservation.title}`}
      onPress={onPress}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
    >
      <View style={[styles.card, isCancelled && styles.cardCancelledCompact]}>
        <View style={[styles.stateLine, isCancelled && styles.stateLineCompact, tone.line]} />

        <View style={styles.mainRow}>
          <ReservationImage reservation={reservation} compact={isCancelled} />

          <View style={styles.content}>
            <View style={styles.titleRow}>
              <Text
                style={[styles.cardTitle, isCancelled && styles.cardTitleCompact]}
                numberOfLines={isCancelled ? 1 : 2}
              >
                {getReservationTitle(reservation)}
              </Text>
              <View style={[styles.statusBadge, isCancelled && styles.statusBadgeCompact, tone.badge]}>
                <MaterialCommunityIcons
                  name={
                    reservation.status === "completed"
                      ? "check-circle"
                      : isCancelled
                        ? "close-circle"
                        : reservation.status === "pending_payment"
                          ? "clock-outline"
                          : "check-circle"
                  }
                  size={isCancelled ? 11 : 12}
                  color={tone.badgeText.color}
                />
                <Text style={[styles.statusBadgeText, tone.badgeText]} numberOfLines={1}>
                  {badge.label}
                </Text>
              </View>
            </View>

            <View style={styles.metaLine}>
              <MaterialCommunityIcons
                name="silverware-fork-knife"
                size={12}
                color={studentPalette.textMuted}
              />
              <Text style={styles.restaurantName} numberOfLines={1}>
                {formatNaturalName(reservation.restaurantName)}
              </Text>
            </View>

            <View style={styles.metaLine}>
              <MaterialCommunityIcons
                name="calendar-blank-outline"
                size={12}
                color={studentPalette.textMuted}
              />
              <Text style={styles.cardDate} numberOfLines={1}>
                {formatReservationDateTime(reservation.reservationDate)}
              </Text>
            </View>
          </View>
        </View>

        {remainingTime ? (
          <View style={styles.expirationRow}>
            <MaterialCommunityIcons
              name="timer-outline"
              size={13}
              color={remainingTime.expired ? studentPalette.danger : studentPalette.warning}
            />
            <Text
              style={[
                styles.expirationText,
                remainingTime.expired && styles.expirationTextExpired,
              ]}
              numberOfLines={1}
            >
              {remainingTime.expired
                ? "Tiempo para pagar agotado"
                : `Tiempo para pagar: ${remainingTime.label}`}
            </Text>
          </View>
        ) : null}

        <View style={[styles.actions, isCancelled && styles.actionsCompact]}>
          {canPay ? (
            <>
              <ReservationAction
                disabled={isPaymentInProgress || isCancelling}
                iconName="credit-card-outline"
                label={isPaying ? "Procesando..." : "Pagar"}
                onPress={() => onPay(reservation.id)}
                primary
              />
              <ReservationAction
                disabled={isCancelling || isPaying}
                iconName="close-circle-outline"
                label={isCancelling ? "Cancelando..." : "Cancelar"}
                onPress={() => onCancel(reservation.id)}
              />
            </>
          ) : null}

          {isActive && !canPay ? (
            <>
              <ReservationAction
                iconName={tone.primaryIcon}
                label="Ver seguimiento"
                onPress={onPress}
                fullWidth
                primary
              />
              <ReservationAction
                iconName="alert-circle-outline"
                label="Reportar problema"
                onPress={onReport}
                tertiary
              />
            </>
          ) : null}

          {isCompleted || isCancelled ? (
            <>
              {onReorder ? (
                <ReservationAction
                  compact={isCancelled}
                  disabled={isReordering}
                  iconName="repeat"
                  label={isReordering ? "Agregando..." : "Volver a pedir"}
                  onPress={onReorder}
                  primary
                  quietPrimary={isCancelled}
                />
              ) : null}
              {isCompleted && isRated ? (
                <View style={styles.ratedPill}>
                  <MaterialCommunityIcons
                    name="star-check"
                    size={13}
                    color={studentPalette.info}
                  />
                  <Text style={styles.ratedText}>Calificado</Text>
                </View>
              ) : isCompleted && onRate ? (
                <ReservationAction
                  iconName="star-outline"
                  label="Calificar"
                  onPress={onRate}
                />
              ) : null}
              {onReport ? (
                <ReservationAction
                  compact={isCancelled}
                  danger={isCancelled}
                  iconName="alert-circle-outline"
                  label="Reportar"
                  onPress={onReport}
                  tertiary={isCompleted}
                />
              ) : null}
            </>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 16,
  },
  pressed: {
    transform: [{ scale: 0.992 }],
  },
  card: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: studentPalette.border,
    backgroundColor: studentPalette.cardElevated,
    padding: 9,
    ...designSystem.shadows.low,
  },
  cardCancelledCompact: {
    padding: 8,
    borderRadius: 15,
    shadowOpacity: 0.55,
    shadowRadius: 6,
    elevation: 1,
  },
  stateLine: {
    position: "absolute",
    top: 9,
    bottom: 9,
    left: 0,
    width: 2,
    borderTopRightRadius: 999,
    borderBottomRightRadius: 999,
  },
  stateLineCompact: {
    top: 8,
    bottom: 8,
  },
  lineActive: {
    backgroundColor: studentPalette.success,
  },
  linePending: {
    backgroundColor: studentPalette.warning,
  },
  lineCompleted: {
    backgroundColor: studentPalette.info,
  },
  lineCancelled: {
    backgroundColor: studentPalette.danger,
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },
  imageFrame: {
    width: 74,
    height: 70,
    borderRadius: 13,
    overflow: "hidden",
    backgroundColor: studentPalette.cardMuted,
  },
  imageFrameCompact: {
    width: 66,
    height: 64,
    borderRadius: 12,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  cardTitle: {
    flex: 1,
    color: studentPalette.textPrimary,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: typography.weights.bold,
  },
  cardTitleCompact: {
    fontSize: 14,
    lineHeight: 17,
  },
  statusBadge: {
    maxWidth: 112,
    minHeight: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusBadgeCompact: {
    maxWidth: 98,
    minHeight: 20,
    paddingHorizontal: 6,
  },
  statusBadgeText: {
    fontSize: 10.5,
    lineHeight: 13,
    fontWeight: typography.weights.semiBold,
  },
  badgeActive: {
    backgroundColor: studentPalette.successSoft,
    borderColor: studentPalette.successBorder,
  },
  badgePending: {
    backgroundColor: studentPalette.warningSoft,
    borderColor: studentPalette.warningBorder,
  },
  badgeCompleted: {
    backgroundColor: studentPalette.infoSoft,
    borderColor: studentPalette.infoBorder,
  },
  badgeCancelled: {
    backgroundColor: studentPalette.dangerSoft,
    borderColor: studentPalette.dangerBorder,
  },
  badgeTextActive: {
    color: studentPalette.success,
  },
  badgeTextPending: {
    color: studentPalette.warning,
  },
  badgeTextCompleted: {
    color: studentPalette.info,
  },
  badgeTextCancelled: {
    color: studentPalette.danger,
  },
  metaLine: {
    minHeight: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  restaurantName: {
    flex: 1,
    color: studentPalette.textSecondary,
    fontSize: 11.5,
    lineHeight: 14,
    fontWeight: typography.weights.semiBold,
  },
  cardDate: {
    flex: 1,
    color: studentPalette.textMuted,
    fontSize: 11.5,
    lineHeight: 14,
  },
  expirationRow: {
    minHeight: 22,
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingLeft: 83,
  },
  expirationText: {
    flex: 1,
    color: studentPalette.warning,
    fontSize: 11.5,
    lineHeight: 14,
    fontWeight: typography.weights.semiBold,
  },
  expirationTextExpired: {
    color: studentPalette.danger,
  },
  actions: {
    marginTop: 7,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  actionsCompact: {
    marginTop: 6,
    gap: 6,
  },
  actionButton: {
    flexGrow: 1,
    flexBasis: 124,
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 9,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionButtonCompact: {
    flexBasis: 104,
    minHeight: 38,
    paddingHorizontal: 7,
    borderRadius: 11,
  },
  fullWidthAction: {
    flexBasis: "100%",
    minHeight: 44,
  },
  primaryAction: {
    backgroundColor: studentPalette.primary,
    borderColor: studentPalette.primary,
    shadowColor: studentPalette.primary,
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  quietPrimaryAction: {
    backgroundColor: studentPalette.primaryFaint,
    borderColor: studentPalette.primarySoft,
    shadowOpacity: 0,
    elevation: 0,
  },
  secondaryAction: {
    backgroundColor: studentPalette.card,
    borderColor: studentPalette.primarySoft,
  },
  tertiaryAction: {
    flexGrow: 0,
    flexBasis: "100%",
    minHeight: 26,
    backgroundColor: "transparent",
    borderColor: "transparent",
    shadowOpacity: 0,
    elevation: 0,
  },
  dangerAction: {
    borderColor: studentPalette.dangerBorder,
    backgroundColor: "transparent",
  },
  actionPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
  actionDisabled: {
    opacity: 0.56,
  },
  actionText: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: typography.weights.semiBold,
  },
  actionTextCompact: {
    fontSize: 11.5,
    lineHeight: 14,
  },
  primaryActionText: {
    color: "#FFFFFF",
  },
  quietPrimaryActionText: {
    color: studentPalette.primary,
  },
  secondaryActionText: {
    color: studentPalette.primary,
  },
  dangerActionText: {
    color: studentPalette.danger,
  },
  ratedPill: {
    flexGrow: 1,
    flexBasis: 120,
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 9,
    borderRadius: 12,
    backgroundColor: studentPalette.infoSoft,
    borderWidth: 1,
    borderColor: studentPalette.infoBorder,
  },
  ratedText: {
    color: studentPalette.info,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: typography.weights.semiBold,
  },
});
