import React, { useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";

import { AppButton, Screen } from "../components";
import { spacing } from "../constants/spacing";
import { useAuth } from "../context/AuthContext";
import { useNetworkStatus } from "../context/NetworkContext";
import {
  confirmPickupDelivery,
  ManagerReservation,
  verifyPickupQr,
} from "../services/reservationService";
import { designSystem, typography } from "../theme";
import { studentPalette } from "../theme/studentPalette";
import { triggerFeedback } from "../utils/haptics";

function friendlyQrError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (message.includes("expir")) return "El código QR ha expirado.";
  if (message.includes("invál") || message.includes("invalid")) return "Código QR inválido.";
  if (message.includes("entreg")) return "La reserva ya fue entregada.";
  if (message.includes("pagada") || message.includes("pendiente")) return "La reserva no está lista para entrega.";
  if (message.includes("cancel")) return "La reserva está cancelada.";
  if (message.includes("401") || message.includes("403")) return "Tu sesión expiró o no tienes permiso.";
  if (message.includes("network") || message.includes("conectar")) return "Sin conexión con el servidor.";

  return "No se pudo validar el QR.";
}

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`;
}

export function ManagerQrScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const { accessToken } = useAuth();
  const [scannedToken, setScannedToken] = useState<string | null>(null);
  const [reservation, setReservation] = useState<ManagerReservation | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isOnline } = useNetworkStatus();

  const handleBarcodeScanned = async (result: BarcodeScanningResult) => {
    if (isVerifying || reservation) return;
    const token = result.data?.trim();
    if (!token || !accessToken) return;
    if (!isOnline) {
      setError("Necesitas conexión a internet para validar el QR.");
      void triggerFeedback("error");
      return;
    }

    try {
      setIsVerifying(true);
      setError(null);
      setScannedToken(token);
      const verified = await verifyPickupQr(accessToken, token);
      setReservation(verified);
      void triggerFeedback("success");
    } catch (scanError: unknown) {
      setScannedToken(null);
      setError(friendlyQrError(scanError));
      void triggerFeedback("error");
    } finally {
      setIsVerifying(false);
    }
  };

  const confirmDelivery = () => {
    if (!accessToken || !scannedToken || isConfirming) return;
    if (!isOnline) {
      Alert.alert(
        "Sin conexión",
        "Necesitas conexión a internet para confirmar la entrega."
      );
      return;
    }

    Alert.alert(
      "Confirmar entrega",
      "Esta acción marcará la reserva como entregada.",
      [
        { text: "Volver", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            try {
              setIsConfirming(true);
              const delivered = await confirmPickupDelivery(
                accessToken,
                scannedToken
              );
              setReservation(delivered);
              void triggerFeedback("success");
              Alert.alert("Entrega confirmada", "Reserva entregada correctamente.");
            } catch (confirmError: unknown) {
              void triggerFeedback("error");
              Alert.alert("No se pudo confirmar", friendlyQrError(confirmError));
            } finally {
              setIsConfirming(false);
            }
          },
        },
      ]
    );
  };

  if (!permission) {
    return (
      <Screen style={styles.container}>
        <Text style={styles.title}>Preparando cámara...</Text>
      </Screen>
    );
  }

  if (!permission.granted) {
    return (
      <Screen style={styles.container}>
        <View style={styles.permissionCard}>
          <Text style={styles.title}>Escanear QR</Text>
          <Text style={styles.description}>
            Necesitamos acceso a la cámara para validar el QR del estudiante.
          </Text>
          <AppButton label="Permitir cámara" onPress={requestPermission} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.title}>Escanear QR</Text>
        <Text style={styles.description}>
          Apunta la cámara al código del estudiante.
        </Text>
      </View>

      {!reservation ? (
        <View style={styles.cameraBox}>
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={handleBarcodeScanned}
          />
          <View pointerEvents="none" style={styles.scanOverlay}>
            <View style={styles.scanFrame}>
              <View style={[styles.scanCorner, styles.scanCornerTopLeft]} />
              <View style={[styles.scanCorner, styles.scanCornerTopRight]} />
              <View style={[styles.scanCorner, styles.scanCornerBottomLeft]} />
              <View style={[styles.scanCorner, styles.scanCornerBottomRight]} />
            </View>
            <Text style={styles.scanHint}>Mantén el QR dentro del marco</Text>
          </View>
        </View>
      ) : (
        <View style={styles.resultCard}>
          <Text style={styles.cardTitle}>Reserva verificada</Text>
          <Text style={styles.description}>
            #{reservation.reservationId.slice(0, 8)}
          </Text>
          <Text style={styles.description}>
            Cliente: {reservation.user?.fullName || "No disponible"}
          </Text>
          <Text style={styles.total}>{formatMoney(reservation.totalAmount)}</Text>

          <FlatList
            data={reservation.items}
            keyExtractor={(item) => item.dishId}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.itemRow}>
                <Text style={styles.itemName}>{item.dishName}</Text>
                <Text style={styles.itemQty}>x{item.quantity}</Text>
              </View>
            )}
          />

          <AppButton
            label={isConfirming ? "Confirmando..." : "Confirmar entrega"}
            onPress={confirmDelivery}
            disabled={isConfirming || reservation.status === "completed"}
            style={styles.confirmButton}
          />
          <AppButton
            label="Escanear otro"
            variant="secondary"
            onPress={() => {
              setReservation(null);
              setScannedToken(null);
              setError(null);
            }}
          />
        </View>
      )}

      {isVerifying ? <Text style={styles.feedback}>Validando QR...</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: studentPalette.background },
  title: {
    color: designSystem.colors.textPrimary,
    fontSize: typography.roles.screenTitle.fontSize,
    lineHeight: typography.roles.screenTitle.lineHeight,
    fontWeight: typography.roles.screenTitle.fontWeight,
  },
  description: {
    marginTop: spacing.xs,
    color: designSystem.colors.textSecondary,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
  },
  permissionCard: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: designSystem.radii.xl,
    backgroundColor: designSystem.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
    ...designSystem.shadows.low,
  },
  headerCard: {
    gap: spacing.xs,
    padding: spacing.lg,
    borderRadius: designSystem.radii.xl,
    backgroundColor: designSystem.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
    ...designSystem.shadows.low,
  },
  cameraBox: {
    marginTop: spacing.lg,
    height: 360,
    borderRadius: designSystem.radii.xl,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  camera: { flex: 1 },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.18)",
  },
  scanFrame: {
    width: 220,
    height: 220,
    borderRadius: designSystem.radii.xl,
  },
  scanCorner: {
    position: "absolute",
    width: 42,
    height: 42,
    borderColor: designSystem.colors.qrBackground,
  },
  scanCornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: designSystem.radii.lg,
  },
  scanCornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: designSystem.radii.lg,
  },
  scanCornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: designSystem.radii.lg,
  },
  scanCornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: designSystem.radii.lg,
  },
  scanHint: {
    marginTop: spacing.lg,
    color: designSystem.colors.qrBackground,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  feedback: {
    marginTop: spacing.md,
    color: designSystem.colors.textSecondary,
    fontSize: typography.sizes.sm,
  },
  error: {
    marginTop: spacing.md,
    color: designSystem.colors.danger,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  resultCard: {
    gap: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: designSystem.radii.xl,
    backgroundColor: designSystem.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
    ...designSystem.shadows.medium,
  },
  cardTitle: {
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  total: {
    color: designSystem.colors.primary,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  itemName: { color: designSystem.colors.textPrimary, fontSize: typography.sizes.sm },
  itemQty: { color: designSystem.colors.textMuted, fontSize: typography.sizes.sm },
  confirmButton: { marginTop: spacing.sm },
});
