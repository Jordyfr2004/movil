import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import type { Socket } from "socket.io-client";

import { AppButton, Screen, StatusBadge } from "../components";
import { spacing } from "../constants/spacing";
import { useAuth } from "../context/AuthContext";
import { useLocalFeedback } from "../context/LocalFeedbackContext";

import { useNetworkStatus } from "../context/NetworkContext";
import { ROUTES } from "../navigation/routes";
import { StudentStackParamList } from "../navigation/types";
import {
  generatePickupQr,
  getMyReservationById,
  PickupQr,
} from "../services/reservationService";
import {
  acquireNotificationsSocket,
  releaseNotificationsSocket,
} from "../services/notificationsSocket";
import { designSystem, typography } from "../theme";
import { studentPalette } from "../theme/studentPalette";
import { Reservation, ReservationStatus } from "../types/models";
import { triggerFeedback } from "../utils/haptics";

type Props = NativeStackScreenProps<
  StudentStackParamList,
  typeof ROUTES.ReservationTracking
>;

type QrState =
  | "not_available"
  | "generating"
  | "available"
  | "used"
  | "expired"
  | "error";

type ReservationDeliveredPayload = {
  reservation_id: string;
  status: string;
  delivery_status: string;
  delivered_at: string;
  message?: string;
};

type ServerEvents = {
  reservation_delivered: (payload: ReservationDeliveredPayload) => void;
};

type ClientEvents = Record<string, never>;

function statusLabel(status: ReservationStatus) {
  switch (status) {
    case "pending_payment":
      return "Pendiente de pago";
    case "confirmed":
      return "Confirmada";
    case "cancelled":
      return "Cancelada";
    case "expired":
      return "Expirada";
    case "completed":
      return "Entregada";
    default:
      return status;
  }
}

function normalizeDeliveredStatus(value: string): ReservationStatus {
  return value.toLowerCase() === "completed" ? "completed" : "confirmed";
}

function formatMoney(value?: number) {
  return `$${(value ?? 0).toFixed(2)}`;
}

function logTrackingDebug(message: string, details: Record<string, unknown>) {
  if (__DEV__) {
    console.log(`[reservation-tracking] ${message}`, details);
  }
}

export function ReservationTrackingScreen({ navigation, route }: Props) {
  const [reservation, setReservation] = useState<Reservation>(
    route.params.reservation
  );
  const [qr, setQr] = useState<PickupQr | null>(null);
  const [qrState, setQrState] = useState<QrState>(
    route.params.reservation.status === "confirmed"
      ? "not_available"
      : route.params.reservation.status === "completed"
        ? "used"
        : "not_available"
  );
  const [qrError, setQrError] = useState<string | null>(null);
  const { accessToken } = useAuth();
  const { hasRatingForReservation } = useLocalFeedback();
  const { isOnline } = useNetworkStatus();
  const [manualRefreshing, setManualRefreshing] = useState(false);
  const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const manualRefreshInFlightRef = useRef(false);

  const restaurantName =
    reservation.items[0]?.restaurantId ?? "Restaurante";

  const progress = useMemo(() => {
    const steps: ReservationStatus[] = [
      "pending_payment",
      "confirmed",
      "completed",
    ];
    return Math.max(0, steps.indexOf(reservation.status));
  }, [reservation.status]);

  const canGenerateQr = reservation.status === "confirmed";

  const applyReservationRefresh = useCallback(
    (nextReservation: Reservation | null) => {
      if (!nextReservation) {
        return;
      }

      setReservation((current) => {
        const previousStatus = current.status;

        if (nextReservation.status !== previousStatus) {
          if (nextReservation.status === "completed") {
            setQrState("used");
            setQr(null);
          } else if (
            previousStatus === "confirmed" &&
            nextReservation.status !== "confirmed"
          ) {
            setQrState("not_available");
            setQr(null);
          }
        }

        return nextReservation;
      });
    },
    []
  );

  const fetchLatestReservation = useCallback(async () => {
    if (!accessToken) return null;

      const nextReservation = await getMyReservationById(
        accessToken,
        reservation.id
      );

      logTrackingDebug("Estado recibido al actualizar", {
        reservationId: reservation.id,
        status: nextReservation?.status ?? "not_found",
      });

      return nextReservation;
  }, [accessToken, reservation.id]);

  const refreshReservationSilently = useCallback(async () => {
    try {
      const nextReservation = await fetchLatestReservation();
      if (!isMountedRef.current) return;
      applyReservationRefresh(nextReservation);
    } catch (error: unknown) {
      logTrackingDebug("Actualización automática falló", {
        message:
          error instanceof Error
            ? error.message
            : "No se pudo actualizar la reserva.",
        reservationId: reservation.id,
      });
    }
  }, [applyReservationRefresh, fetchLatestReservation, reservation.id]);

  const refreshReservationManually = useCallback(async () => {
    if (manualRefreshInFlightRef.current) {
      return;
    }

    if (!isOnline) {
      void triggerFeedback("warning");

      Alert.alert(
        "Sin conexión",
        "Necesitas conexión a internet para actualizar la reserva."
      );

      return;
    }

    manualRefreshInFlightRef.current = true;
    setManualRefreshing(true);

    try {
      const nextReservation = await fetchLatestReservation();

      if (!isMountedRef.current) {
        return;
      }

      applyReservationRefresh(nextReservation);
      void triggerFeedback("success");
    } catch {
      if (!isMountedRef.current) {
        return;
      }

      void triggerFeedback("error");

      Alert.alert(
        "No se pudo actualizar",
        "No pudimos consultar el estado de la reserva. Inténtalo nuevamente."
      );
    } finally {
      manualRefreshInFlightRef.current = false;

      if (isMountedRef.current) {
        setManualRefreshing(false);
      }
    }
  }, [applyReservationRefresh, fetchLatestReservation, isOnline]);

  useEffect(() => {
    isMountedRef.current = true;
    void refreshReservationSilently();

    return () => {
      isMountedRef.current = false;
    };
  }, [refreshReservationSilently]);

  useFocusEffect(
    useCallback(() => {
      void refreshReservationSilently();
    }, [refreshReservationSilently])
  );

  useEffect(() => {
    if (!accessToken) return;

    const socket = acquireNotificationsSocket(accessToken) as Socket<
      ServerEvents,
      ClientEvents
    >;

    const handleDelivered = (
      payload: ReservationDeliveredPayload
    ) => {
      if (payload.reservation_id !== reservation.id) {
        return;
      }

      setReservation((current) => ({
        ...current,
        status: normalizeDeliveredStatus(payload.status),
        deliveredAt: payload.delivered_at,
        deliveryStatus: payload.delivery_status,
      }));

      setQrState("used");
      setQr(null);

      Alert.alert(
        "Reserva entregada",
        "Tu reserva fue entregada correctamente."
      );
    };
    socket.on("reservation_delivered", handleDelivered);

    return () => {
      socket.off("reservation_delivered", handleDelivered);
      releaseNotificationsSocket(accessToken);
    };
  }, [accessToken, reservation.id]);

  useEffect(() => {
    return () => {
      if (expiryTimerRef.current) {
        clearTimeout(expiryTimerRef.current);
      }
    };
  }, []);

  const scheduleExpiry = (expiresAt: string) => {
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current);
    }

    const delay = Math.max(
      0,
      new Date(expiresAt).getTime() - Date.now()
    );

    expiryTimerRef.current = setTimeout(() => {
      setQrState("expired");
      setQr(null);

      void triggerFeedback("warning");
    }, delay);
  };

  const handleGenerateQr = async () => {
    if (!accessToken) {
      setQrError("Tu sesión expiró. Vuelve a iniciar sesión.");
      setQrState("error");

      void triggerFeedback("error");

      return;
    }

    if (!isOnline) {
      setQrError(
        "Necesitas conexión a internet para generar el QR."
      );

      setQrState("error");

      void triggerFeedback("warning");

      return;
    }

    if (!canGenerateQr) {
      setQrState(
        reservation.status === "completed"
          ? "used"
          : "not_available"
      );

      void triggerFeedback("warning");

      return;
    }

    try {
      setQrState("generating");
      setQrError(null);
      const nextQr = await generatePickupQr(accessToken, reservation.id);
      logTrackingDebug("Respuesta al generar QR", {
        expiresAt: nextQr.expiresAt,
        hasPickupToken: Boolean(nextQr.pickupToken),
        reservationId: reservation.id,
        status: reservation.status,
      });
      setQr(nextQr);
      setQrState("available");
      void triggerFeedback("success");
      scheduleExpiry(nextQr.expiresAt);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message.toLowerCase() : "";
      setQrState("error");
      setQrError(
        message.includes("expir")
          ? "El QR expiró. Genera uno nuevo."
          : message.includes("entreg")
            ? "Esta reserva ya fue entregada."
            : "No se pudo generar el QR."
      );
      void triggerFeedback("error");
    }
  };

  return (
    <Screen style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerCard}>
          <Text style={styles.eyebrow}>Reserva</Text>
          <Text style={styles.title} numberOfLines={1}>
            #{reservation.id.slice(0, 8)}
          </Text>
          <Text style={styles.subtitle}>{restaurantName}</Text>
          <StatusBadge
            label={statusLabel(reservation.status)}
            tone={
              reservation.status === "completed"
                ? "success"
                : reservation.status === "cancelled" ||
                    reservation.status === "expired"
                  ? "danger"
                  : reservation.status === "pending_payment"
                    ? "warning"
                    : "info"
            }
          />
          <AppButton
            label={manualRefreshing ? "Actualizando..." : "Actualizar estado"}
            onPress={refreshReservationManually}
            disabled={manualRefreshing}
            variant="secondary"
            style={styles.refreshButton}
          />
        </View>

        <View style={styles.progressCard}>
          {["Pedido confirmado", "Pago confirmado", "En preparación", "Entregado"].map((label, index) => {
            const stepIndex = Math.min(index, 2);
            const active = stepIndex <= progress;
            const current = stepIndex === progress;

            return (
            <View key={label} style={styles.progressItem}>
              {index < 3 ? <View style={styles.progressLine} /> : null}
              <View
                style={[
                  styles.progressDot,
                  active && styles.progressDotActive,
                  current && styles.progressDotCurrent,
                ]}
              >
                <MaterialCommunityIcons
                  name={active ? "check" : "circle-medium"}
                  size={active ? 16 : 14}
                  color={
                    active
                      ? designSystem.colors.textInverted
                      : designSystem.colors.textMuted
                  }
                />
              </View>
              <View style={styles.progressCopy}>
                <Text
                  style={[
                    styles.progressLabel,
                    active && styles.progressLabelActive,
                  ]}
                >
                  {label}
                </Text>
                <Text style={styles.progressMeta}>
                  {active ? statusLabel(reservation.status) : "Pendiente"}
                </Text>
              </View>
            </View>
            );
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Productos</Text>
          {reservation.items.map((item) => (
            <View key={`${item.id}-${item.dishId}`} style={styles.itemRow}>
              <View style={styles.itemText}>
                <Text style={styles.itemName}>{item.dishName}</Text>
                {item.dishDescription ? (
                  <Text style={styles.itemDescription}>
                    {item.dishDescription}
                  </Text>
                ) : null}
              </View>
              <Text style={styles.itemPrice}>
                {item.quantity ?? 1} x ${item.unitPrice.toFixed(2)}
              </Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {formatMoney(reservation.totalAmount)}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>QR de retiro</Text>
          <Text style={styles.warning}>
            No compartas este QR. Muéstralo solo al manager del restaurante.
          </Text>

          {qrState === "available" && qr?.pickupToken ? (
            <View
              style={styles.qrBox}
              accessible
              accessibilityRole="image"
              accessibilityLabel="Código QR de retiro disponible"
            >
              <View style={styles.qrSurface}>
                <QRCode value={qr.pickupToken} size={210} />
              </View>
              <Text style={styles.qrHint}>Disponible hasta {new Date(qr.expiresAt).toLocaleTimeString()}</Text>
            </View>
          ) : (
            <Text style={styles.qrStateText}>
              {qrState === "generating"
                ? "Generando QR..."
                : qrState === "used"
                  ? "QR utilizado. Reserva entregada."
                  : qrState === "expired"
                    ? "El QR expiró."
                    : qrState === "error"
                      ? qrError
                      : "Disponible cuando la reserva esté pagada."}
            </Text>
          )}

          <AppButton
            label={
              qrState === "available"
                ? "QR generado"
                : qrState === "expired"
                  ? "Generar nuevo QR"
                  : qrState === "generating"
                    ? "Generando QR..."
                    : "Generar QR"
            }
            onPress={handleGenerateQr}
            disabled={
              !canGenerateQr ||
              qrState === "generating" ||
              qrState === "available"
            }
            style={styles.qrButton}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Experiencia</Text>
          {reservation.status === "completed" ? (
            <AppButton
              label={
                hasRatingForReservation(reservation.id)
                  ? "Editar calificación"
                  : "Calificar pedido"
              }
              onPress={() =>
                navigation.navigate(ROUTES.Rating, { reservation })
              }
              variant="secondary"
            />
          ) : null}
          <AppButton
            label="Reportar problema"
            onPress={() =>
              navigation.navigate(ROUTES.ProblemReport, {
                reservationId: reservation.id,
              })
            }
            variant="secondary"
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: studentPalette.background },
  scroll: { flex: 1, backgroundColor: "transparent" },
  content: { gap: spacing.md, paddingBottom: spacing.xxxl },
  headerCard: {
    padding: spacing.lg,
    borderRadius: designSystem.radii.xl,
    backgroundColor: designSystem.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
    ...designSystem.shadows.medium,
    gap: spacing.sm,
  },
  eyebrow: {
    color: designSystem.colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  title: {
    marginTop: spacing.xs,
    color: designSystem.colors.textPrimary,
    fontSize: typography.roles.heroTitle.fontSize,
    lineHeight: typography.roles.heroTitle.lineHeight,
    fontWeight: typography.roles.heroTitle.fontWeight,
  },
  subtitle: { color: designSystem.colors.textSecondary, fontSize: typography.sizes.sm },
  refreshButton: {
    marginTop: spacing.md,
  },
  progressCard: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: designSystem.radii.xl,
    backgroundColor: designSystem.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
    ...designSystem.shadows.low,
  },
  progressItem: {
    position: "relative",
    minHeight: 58,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  progressLine: {
    position: "absolute",
    left: 16,
    top: 34,
    bottom: -24,
    width: 2,
    borderRadius: 999,
    backgroundColor: designSystem.colors.border,
  },
  progressDot: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: designSystem.colors.neutralSoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: designSystem.colors.neutralBorder,
  },
  progressDotActive: {
    backgroundColor: designSystem.colors.primary,
    borderColor: designSystem.colors.primary,
  },
  progressDotCurrent: {
    shadowColor: designSystem.colors.primary,
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  progressCopy: {
    flex: 1,
    gap: 2,
  },
  progressLabel: {
    color: designSystem.colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  progressLabelActive: {
    color: designSystem.colors.textPrimary,
  },
  progressMeta: {
    color: designSystem.colors.textMuted,
    fontSize: typography.sizes.xs,
  },
  card: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: designSystem.radii.xl,
    backgroundColor: designSystem.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
    ...designSystem.shadows.low,
  },
  sectionTitle: {
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  itemRow: { flexDirection: "row", gap: spacing.md },
  itemText: { flex: 1 },
  itemName: { color: designSystem.colors.textPrimary, fontWeight: typography.weights.bold },
  itemDescription: { color: designSystem.colors.textMuted, fontSize: typography.sizes.xs },
  itemPrice: { color: designSystem.colors.primary, fontWeight: typography.weights.bold },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: designSystem.colors.border,
    paddingTop: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalLabel: { color: designSystem.colors.textPrimary, fontWeight: typography.weights.bold },
  totalValue: {
    color: designSystem.colors.primary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  warning: { color: designSystem.colors.warning, fontSize: typography.sizes.sm },
  qrBox: { alignItems: "center", gap: spacing.md, paddingVertical: spacing.md },
  qrSurface: {
    padding: spacing.md,
    borderRadius: designSystem.radii.lg,
    backgroundColor: designSystem.colors.qrBackground,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
  },
  qrHint: { color: designSystem.colors.textMuted, fontSize: typography.sizes.xs },
  qrStateText: { color: designSystem.colors.textSecondary, fontSize: typography.sizes.sm },
  qrButton: { marginTop: spacing.sm },
});
