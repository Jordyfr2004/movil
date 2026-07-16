import React, { useCallback, useMemo, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, Vibration, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { useStripe } from "@stripe/stripe-react-native";

import {
  MyReservationCard,
  MyReservationsFeedback,
  MyReservationsHeader,
} from "../components/myReservations";
import { Screen } from "../components/Screen";
import {
  StudentStatusPill,
  StudentStatusTone,
} from "../components/StudentStatusPill";
import { spacing } from "../constants/spacing";
import { STRIPE_PUBLISHABLE_KEY } from "../constants/stripe";
import { useAuth } from "../context/AuthContext";
import {
  ReservationListItem,
  useReservations,
} from "../hooks/useReservations";
import { ROUTES } from "../navigation/routes";
import { StudentStackParamList } from "../navigation/types";
import { createPaymentIntent } from "../services/paymentService";
import { cancelReservation } from "../services/reservationService";
import {
  acquireNotificationsSocket,
  releaseNotificationsSocket,
} from "../services/notificationsSocket";
import { typography } from "../theme";
import { studentPalette } from "../theme/studentPalette";
import type { ReservationStatus } from "../types/models";

type UnknownRecord = Record<string, unknown>;

type Props = NativeStackScreenProps<
  StudentStackParamList,
  typeof ROUTES.MyReservations
>;

type ReservationSectionConfig = {
  key: string;
  title: string;
  subtitle: string;
  statuses: ReservationStatus[];
  tone: StudentStatusTone;
};

type ReservationListRow =
  | {
      type: "section";
      key: string;
      count: number;
      section: ReservationSectionConfig;
    }
  | {
      type: "reservation";
      key: string;
      reservation: ReservationListItem;
    };

const RESERVATION_SECTIONS: ReservationSectionConfig[] = [
  {
    key: "pending_payment",
    title: "Pendiente de pago",
    subtitle: "Reservas por completar",
    statuses: ["pending_payment"],
    tone: "warning",
  },
  {
    key: "confirmed",
    title: "Confirmadas",
    subtitle: "Listas para retirar",
    statuses: ["confirmed"],
    tone: "success",
  },
  {
    key: "cancelled",
    title: "Canceladas",
    subtitle: "Canceladas o expiradas",
    statuses: ["cancelled", "expired"],
    tone: "danger",
  },
  {
    key: "completed",
    title: "Completadas",
    subtitle: "Historial finalizado",
    statuses: ["completed"],
    tone: "info",
  },
];

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function readErrorMessage(error: unknown, fallback: string): string {
  if (!isRecord(error)) {
    return fallback;
  }

  return typeof error.message === "string" && error.message
    ? error.message
    : fallback;
}

export function MyReservationsScreen({
  bottomInset = 0,
}: Partial<Props> & { bottomInset?: number }) {
  const navigation =
    useNavigation<NativeStackNavigationProp<StudentStackParamList>>();
  const { accessToken } = useAuth();
  const { reservations, loading, error, reload } = useReservations(accessToken);
  const [isCancelling, setIsCancelling] = useState(false);
  const [payingReservationId, setPayingReservationId] = useState<string | null>(
    null
  );
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  React.useEffect(() => {
    if (!accessToken) return;

    const socket = acquireNotificationsSocket(accessToken);
    const handleDelivered = () => {
      Vibration.vibrate(80);
      void reload();
    };

    socket.on("reservation_delivered", handleDelivered);
    return () => {
      socket.off("reservation_delivered", handleDelivered);
      releaseNotificationsSocket(accessToken);
    };
  }, [accessToken, reload]);

  const activeCount = useMemo(() => {
    return reservations.filter(
      (reservation) =>
        reservation.status === "confirmed" ||
        reservation.status === "pending_payment"
    ).length;
  }, [reservations]);

  const reservationRows = useMemo<ReservationListRow[]>(() => {
    return RESERVATION_SECTIONS.flatMap((section) => {
      const items = reservations.filter((reservation) =>
        section.statuses.includes(reservation.status)
      );

      if (items.length === 0) {
        return [];
      }

      return [
        {
          type: "section",
          key: `section-${section.key}`,
          count: items.length,
          section,
        },
        ...items.map((reservation) => ({
          type: "reservation" as const,
          key: `reservation-${reservation.id}`,
          reservation,
        })),
      ];
    });
  }, [reservations]);

  const handleCancel = async (reservationId: string) => {
    if (isCancelling) {
      return;
    }

    if (!accessToken) {
      Alert.alert("Sesión requerida", "Inicia sesión para cancelar una reserva.");
      return;
    }

    try {
      setIsCancelling(true);
      await cancelReservation(accessToken, reservationId);
      await reload();
    } catch (error: unknown) {
      Alert.alert(
        "Error",
        readErrorMessage(error, "No se pudo cancelar la reserva")
      );
    } finally {
      setIsCancelling(false);
    }
  };

  const confirmCancel = (reservationId: string) => {
    Alert.alert(
      "Cancelar reserva",
      "Esta acción cancelará tu reserva. ¿Deseas continuar?",
      [
        { text: "Volver", style: "cancel" },
        {
          text: "Cancelar",
          style: "destructive",
          onPress: () => handleCancel(reservationId),
        },
      ]
    );
  };

  const handlePay = async (reservationId: string) => {
    if (payingReservationId) {
      return;
    }

    if (!STRIPE_PUBLISHABLE_KEY) {
      Alert.alert(
        "Falta configurar Stripe",
        "Define EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY (pk_test_...) y reinicia la app."
      );
      return;
    }

    if (!accessToken) {
      Alert.alert("Sesión requerida", "Inicia sesión para pagar la reserva.");
      return;
    }

    try {
      setPayingReservationId(reservationId);

      const intent = await createPaymentIntent(accessToken, reservationId);
      if (!intent.clientSecret) {
        throw new Error("No se recibió clientSecret del servidor");
      }

      const init = await initPaymentSheet({
        merchantDisplayName: "Movil",
        paymentIntentClientSecret: intent.clientSecret,
      });

      if (init.error) {
        throw new Error(init.error.message);
      }

      const presented = await presentPaymentSheet();
      if (presented.error) {
        throw new Error(presented.error.message);
      }

      Alert.alert("Pago completado", "Pago realizado. Actualizando reserva...");
      await reload();
    } catch (error: unknown) {
      Alert.alert(
        "Error",
        readErrorMessage(error, "No se pudo completar el pago")
      );
    } finally {
      setPayingReservationId(null);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <MyReservationsFeedback
          error={null}
          loading
          onRetry={reload}
          style={styles.feedbackState}
        />
      );
    }

    if (error) {
      return (
        <MyReservationsFeedback
          error={error}
          loading={false}
          onRetry={reload}
          style={styles.feedbackState}
        />
      );
    }

    if (reservations.length === 0) {
      return (
        <MyReservationsFeedback
          error={null}
          loading={false}
          onRetry={reload}
          style={styles.feedbackState}
        />
      );
    }

    return (
      <FlatList
        style={styles.list}
        data={reservationRows}
        keyExtractor={(item) => item.key}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: bottomInset + spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) =>
          item.type === "section" ? (
            <ReservationSectionHeader
              count={item.count}
              section={item.section}
            />
          ) : (
            <MyReservationCard
              isCancelling={isCancelling}
              isPaymentInProgress={Boolean(payingReservationId)}
              isPaying={payingReservationId === item.reservation.id}
              reservation={item.reservation}
              onCancel={confirmCancel}
              onPay={handlePay}
              onPress={() =>
                navigation?.navigate?.(ROUTES.ReservationTracking, {
                  reservation: item.reservation,
                })
              }
            />
          )
        }
      />
    );
  };

  return (
    <Screen style={styles.container}>
      <MyReservationsHeader
        activeCount={activeCount}
        hasError={Boolean(error)}
        loading={loading}
      />

      {renderContent()}
    </Screen>
  );
}

function ReservationSectionHeader({
  count,
  section,
}: {
  count: number;
  section: ReservationSectionConfig;
}) {
  const sectionStyle = getSectionStyle(section.tone);

  return (
    <View style={styles.statusSection}>
      <View style={[styles.statusAccent, sectionStyle.accent]} />
      <View style={styles.statusSectionText}>
        <Text style={[styles.statusSectionTitle, sectionStyle.title]}>
          {section.title}
        </Text>
        <Text style={styles.statusSectionSubtitle}>{section.subtitle}</Text>
      </View>
      <StudentStatusPill label={String(count)} tone={section.tone} />
    </View>
  );
}

function getSectionStyle(tone: StudentStatusTone) {
  switch (tone) {
    case "success":
      return {
        accent: styles.accentSuccess,
        title: styles.titleSuccess,
      };
    case "warning":
      return {
        accent: styles.accentWarning,
        title: styles.titleWarning,
      };
    case "danger":
      return {
        accent: styles.accentDanger,
        title: styles.titleMuted,
      };
    case "info":
    default:
      return {
        accent: styles.accentInfo,
        title: styles.titleMuted,
      };
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: studentPalette.background,
  },
  listContent: {
    gap: spacing.sm,
  },
  list: {
    flex: 1,
    backgroundColor: "transparent",
  },
  statusSection: {
    marginTop: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  statusAccent: {
    width: 3,
    height: 28,
    borderRadius: 999,
  },
  accentWarning: {
    backgroundColor: "rgba(217, 119, 6, 0.48)",
  },
  accentSuccess: {
    backgroundColor: "rgba(35, 148, 71, 0.42)",
  },
  accentDanger: {
    backgroundColor: "rgba(214, 40, 40, 0.28)",
  },
  accentInfo: {
    backgroundColor: "rgba(70, 98, 122, 0.28)",
  },
  statusSectionText: {
    flex: 1,
    minWidth: 0,
  },
  statusSectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: studentPalette.textPrimary,
    lineHeight: typography.lineHeights.md,
  },
  titleWarning: {
    color: studentPalette.warning,
  },
  titleSuccess: {
    color: studentPalette.success,
  },
  titleMuted: {
    color: studentPalette.textSecondary,
  },
  statusSectionSubtitle: {
    fontSize: typography.sizes.xs,
    color: studentPalette.textMuted,
    lineHeight: typography.lineHeights.xs,
  },
  feedbackState: {
    marginTop: spacing.sm,
    borderRadius: 16,
    borderColor: studentPalette.border,
    backgroundColor: studentPalette.card,
    shadowColor: studentPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 1,
  },
});
