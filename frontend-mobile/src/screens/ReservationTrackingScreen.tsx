import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import QRCode from "react-native-qrcode-svg";
import type { Socket } from "socket.io-client";

import { AppButton, Screen } from "../components";
import { spacing } from "../constants/spacing";
import { useAuth } from "../context/AuthContext";
import { useLocalFeedback } from "../context/LocalFeedbackContext";
import { useLocalNotifications } from "../context/LocalNotificationsContext";
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
  const { addNotification } = useLocalNotifications();
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
    if (manualRefreshInFlightRef.current) return;

    manualRefreshInFlightRef.current = true;
    setManualRefreshing(true);

    try {
      const nextReservation = await fetchLatestReservation();
      if (!isMountedRef.current) return;
      applyReservationRefresh(nextReservation);
    } catch {
      if (!isMountedRef.current) return;
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
  }, [applyReservationRefresh, fetchLatestReservation]);

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

    const handleDelivered = (payload: ReservationDeliveredPayload) => {
      if (payload.reservation_id !== reservation.id) return;

      setReservation((current) => ({
        ...current,
        status: normalizeDeliveredStatus(payload.status),
        deliveredAt: payload.delivered_at,
        deliveryStatus: payload.delivery_status,
      }));
      setQrState("used");
      setQr(null);
      addNotification({
        kind: "delivered",
        title: "Reserva entregada",
        message: payload.message ?? "Tu reserva fue entregada correctamente.",
        reservationId: reservation.id,
      });
      Vibration.vibrate(80);
      Alert.alert("Reserva entregada", "Tu reserva fue entregada correctamente.");
    };

    socket.on("reservation_delivered", handleDelivered);

    return () => {
      socket.off("reservation_delivered", handleDelivered);
      releaseNotificationsSocket(accessToken);
    };
  }, [accessToken, addNotification, reservation.id]);

  useEffect(() => {
    return () => {
      if (expiryTimerRef.current) {
        clearTimeout(expiryTimerRef.current);
      }
    };
  }, []);

  const scheduleExpiry = (expiresAt: string) => {
    if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
    const delay = Math.max(0, new Date(expiresAt).getTime() - Date.now());
    expiryTimerRef.current = setTimeout(() => {
      setQrState("expired");
      setQr(null);
    }, delay);
  };

  const handleGenerateQr = async () => {
    if (!accessToken) {
      setQrError("Tu sesión expiró. Vuelve a iniciar sesión.");
      setQrState("error");
      return;
    }

    if (!canGenerateQr) {
      setQrState(reservation.status === "completed" ? "used" : "not_available");
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
          <Text style={styles.status}>{statusLabel(reservation.status)}</Text>
          <AppButton
            label={manualRefreshing ? "Actualizando..." : "Actualizar estado"}
            onPress={refreshReservationManually}
            disabled={manualRefreshing}
            variant="secondary"
            style={styles.refreshButton}
          />
        </View>

        <View style={styles.progressCard}>
          {["Creada", "Pagada", "Entregada"].map((label, index) => (
            <View key={label} style={styles.progressItem}>
              <View
                style={[
                  styles.progressDot,
                  index <= progress && styles.progressDotActive,
                ]}
              />
              <Text style={styles.progressLabel}>{label}</Text>
            </View>
          ))}
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
            <View style={styles.qrBox}>
              <QRCode value={qr.pickupToken} size={210} />
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
            label={qrState === "expired" ? "Generar nuevo QR" : "Generar QR"}
            onPress={handleGenerateQr}
            disabled={!canGenerateQr || qrState === "generating"}
            style={styles.qrButton}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Experiencia</Text>
          {reservation.status === "completed" ? (
            <AppButton
              label={
                hasRatingForReservation(reservation.id)
                  ? "Editar calificación local"
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
    borderRadius: 20,
    backgroundColor: designSystem.colors.surface,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
    ...designSystem.shadows.sm,
  },
  eyebrow: {
    color: designSystem.colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  title: {
    marginTop: spacing.xs,
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  subtitle: { color: designSystem.colors.textSecondary, fontSize: typography.sizes.sm },
  status: {
    marginTop: spacing.sm,
    color: designSystem.colors.success,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  refreshButton: {
    marginTop: spacing.md,
  },
  progressCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.md,
    borderRadius: 18,
    backgroundColor: designSystem.colors.surface,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
  },
  progressItem: { flex: 1, alignItems: "center", gap: spacing.xs },
  progressDot: {
    width: 14,
    height: 14,
    borderRadius: 999,
    backgroundColor: designSystem.colors.neutralSoft,
  },
  progressDotActive: { backgroundColor: designSystem.colors.primary },
  progressLabel: { color: designSystem.colors.textSecondary, fontSize: typography.sizes.xs },
  card: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: 20,
    backgroundColor: designSystem.colors.surface,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
    ...designSystem.shadows.sm,
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
  qrHint: { color: designSystem.colors.textMuted, fontSize: typography.sizes.xs },
  qrStateText: { color: designSystem.colors.textSecondary, fontSize: typography.sizes.sm },
  qrButton: { marginTop: spacing.sm },
});
