import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Accelerometer } from "expo-sensors";
import { Screen } from "../components/Screen";
import { AppButton } from "../components/AppButton";
import { colors, typography } from "../theme";
import { spacing } from "../constants/spacing";

type SensorData = {
  x: number;
  y: number;
  z: number;
};

type SensorSubscription = { remove: () => void };

type MovementState =
  | "Sin iniciar"
  | "Sensor detenido"
  | "Celular quieto"
  | "Movimiento leve"
  | "Movimiento fuerte";

export function SensorMovimientoScreen() {
  const [data, setData] = useState<SensorData>({ x: 0, y: 0, z: 0 });
  const [subscription, setSubscription] = useState<SensorSubscription | null>(
    null
  );
  const [movementState, setMovementState] = useState<MovementState>(
    "Sin iniciar"
  );

  const rounded = (value: number) => Number(value).toFixed(2);

  const calculateMovement = (x: number, y: number, z: number): MovementState => {
    const intensity = Math.abs(x) + Math.abs(y) + Math.abs(z);

    if (intensity < 1.2) return "Celular quieto";
    if (intensity < 2.0) return "Movimiento leve";
    return "Movimiento fuerte";
  };

  const startSensor = () => {
    Accelerometer.setUpdateInterval(300);

    const nextSubscription = Accelerometer.addListener(({ x, y, z }) => {
      setData({ x, y, z });
      setMovementState(calculateMovement(x, y, z));
    });

    setSubscription(nextSubscription);
  };

  const stopSensor = () => {
    if (!subscription) return;

    subscription.remove();
    setSubscription(null);
    setMovementState("Sensor detenido");
    setData({ x: 0, y: 0, z: 0 });
  };

  const toggleSensor = () => {
    if (subscription) stopSensor();
    else startSensor();
  };

  useEffect(() => {
    return () => {
      subscription?.remove();
    };
  }, [subscription]);

  const movementColor = useMemo(() => {
    if (movementState === "Celular quieto") return colors.success;
    if (movementState === "Movimiento leve") return colors.primary;
    if (movementState === "Movimiento fuerte") return colors.error;
    return colors.textMuted;
  }, [movementState]);

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sensor Acelerómetro</Text>
        <Text style={styles.subtitle}>
          Lee el movimiento del dispositivo en tiempo real usando los ejes X, Y
          y Z.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.stateRow}>
          <Text style={styles.stateLabel}>Estado del movimiento</Text>
          <View style={styles.statePill}>
            <Text style={[styles.stateValue, { color: movementColor }]}>
              {movementState}
            </Text>
          </View>
        </View>

        <View style={styles.valuesRow}>
          <View style={styles.valueCard}>
            <Text style={styles.axis}>X</Text>
            <Text style={styles.value}>{rounded(data.x)}</Text>
          </View>
          <View style={styles.valueCard}>
            <Text style={styles.axis}>Y</Text>
            <Text style={styles.value}>{rounded(data.y)}</Text>
          </View>
          <View style={styles.valueCard}>
            <Text style={styles.axis}>Z</Text>
            <Text style={styles.value}>{rounded(data.z)}</Text>
          </View>
        </View>

        <AppButton
          label={subscription ? "Detener sensor" : "Iniciar sensor"}
          onPress={toggleSensor}
          variant={subscription ? "danger" : "primary"}
        />

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Interpretación</Text>
          <Text style={styles.infoText}>
            Si el celular está estable, el estado será "Celular quieto". Si se
            mueve ligeramente, mostrará "Movimiento leve". Si se sacude o se
            mueve con fuerza, mostrará "Movimiento fuerte".
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeights.xl,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 1,
    gap: spacing.lg,
  },
  stateRow: {
    gap: spacing.sm,
  },
  stateLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  statePill: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stateValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.lg,
  },
  valuesRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  valueCard: {
    flex: 1,
    backgroundColor: colors.primarySoft,
    borderRadius: 16,
    paddingVertical: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  axis: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.primary,
  },
  value: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeights.lg,
  },
  infoBox: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  infoTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeights.md,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
});
