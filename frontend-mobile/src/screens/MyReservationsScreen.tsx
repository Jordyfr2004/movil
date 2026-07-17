import React, { useCallback, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
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
import { useCart } from "../context/CartContext";
import { useLocalNotifications } from "../context/LocalNotificationsContext";
import { useNetworkStatus } from "../context/NetworkContext";
import {
  ReservationListItem,
  useReservations,
} from "../hooks/useReservations";
import { ROUTES } from "../navigation/routes";
import { StudentStackParamList } from "../navigation/types";
import { createPaymentIntent } from "../services/paymentService";
import { cancelReservation } from "../services/reservationService";
import { getPublicDishesByRestaurant } from "../services/dishService";
import {
  acquireNotificationsSocket,
  releaseNotificationsSocket,
} from "../services/notificationsSocket";
import { getRestaurants } from "../services/restaurantService";
import { typography } from "../theme";
import { studentPalette } from "../theme/studentPalette";
import { triggerFeedback } from "../utils/haptics";
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

type OrderTabKey = "active" | "completed" | "cancelled";

const ORDER_TABS: Array<{
  key: OrderTabKey;
  label: string;
  statuses: ReservationStatus[];
}> = [
  { key: "active", label: "Activos", statuses: ["pending_payment", "confirmed"] },
  { key: "completed", label: "Completados", statuses: ["completed"] },
  { key: "cancelled", label: "Cancelados", statuses: ["cancelled", "expired"] },
];

const RESERVATION_SECTIONS: ReservationSectionConfig[] = [
  {
    key: "today",
    title: "Hoy",
    subtitle: "Movimientos de hoy",
    statuses: ["pending_payment", "confirmed", "completed", "cancelled", "expired"],
    tone: "info",
  },
  {
    key: "week",
    title: "Esta semana",
    subtitle: "Reservas recientes",
    statuses: ["pending_payment", "confirmed", "completed", "cancelled", "expired"],
    tone: "success",
  },
  {
    key: "month",
    title: "Este mes",
    subtitle: "Historial del mes",
    statuses: ["pending_payment", "confirmed", "completed", "cancelled", "expired"],
    tone: "warning",
  },
  {
    key: "older",
    title: "Anteriores",
    subtitle: "Reservas pasadas",
    statuses: ["pending_payment", "confirmed", "completed", "cancelled", "expired"],
    tone: "info",
  },
];

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function getDateGroup(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "older";

  const today = startOfDay(new Date());
  const target = startOfDay(date);
  const diffDays = Math.floor(
    (today.getTime() - target.getTime()) / (24 * 60 * 60 * 1000)
  );

  if (diffDays === 0) return "today";
  if (diffDays >= 0 && diffDays < 7) return "week";
  if (
    target.getMonth() === today.getMonth() &&
    target.getFullYear() === today.getFullYear()
  ) {
    return "month";
  }
  return "older";
}

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
  const { addDish } = useCart();
  const { addNotification } = useLocalNotifications();
  const { isOnline } = useNetworkStatus();
  const { reservations, loading, error, reload } = useReservations(accessToken);
  const [isCancelling, setIsCancelling] = useState(false);
  const [payingReservationId, setPayingReservationId] = useState<string | null>(
    null
  );
  const [selectedTab, setSelectedTab] = useState<OrderTabKey>("active");
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  React.useEffect(() => {
    if (!accessToken) return;

    const socket = acquireNotificationsSocket(accessToken);
    const handleDelivered = (payload?: { reservation_id?: string; message?: string }) => {
      addNotification({
        kind: "delivered",
        title: "Reserva entregada",
        message: payload?.message ?? "Tu reserva fue entregada correctamente.",
        reservationId: payload?.reservation_id,
      });
      void triggerFeedback("success");
      void reload();
    };

    socket.on("reservation_delivered", handleDelivered);
    return () => {
      socket.off("reservation_delivered", handleDelivered);
      releaseNotificationsSocket(accessToken);
    };
  }, [accessToken, addNotification, reload]);

  const activeCount = useMemo(() => {
    return reservations.filter(
      (reservation) =>
        reservation.status === "confirmed" ||
        reservation.status === "pending_payment"
    ).length;
  }, [reservations]);

  const reservationRows = useMemo<ReservationListRow[]>(() => {
    const selectedStatuses =
      ORDER_TABS.find((tab) => tab.key === selectedTab)?.statuses ?? [];

    return RESERVATION_SECTIONS.flatMap((section) => {
      const items = reservations.filter(
        (reservation) =>
          selectedStatuses.includes(reservation.status) &&
          section.statuses.includes(reservation.status) &&
          getDateGroup(reservation.reservationDate) === section.key
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
  }, [reservations, selectedTab]);

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

    if (!isOnline) {
      Alert.alert(
        "Sin conexión",
        "Necesitas conexión a internet para completar el pago."
      );
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
        throw new Error("No pudimos preparar el pago.");
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

  const handleReorder = async (reservation: ReservationListItem) => {
    const restaurantId = reservation.items[0]?.restaurantId;
    if (!restaurantId) {
      Alert.alert("No disponible", "No se pudo identificar el restaurante.");
      return;
    }

    try {
      const [restaurants, dishes] = await Promise.all([
        getRestaurants(),
        getPublicDishesByRestaurant(restaurantId),
      ]);
      const restaurant = restaurants.find(
        (item) => String(item.id) === String(restaurantId)
      );

      if (!restaurant || !restaurant.isActive) {
        Alert.alert("No disponible", "El restaurante ya no está disponible.");
        return;
      }

      const dishById = new Map(dishes.map((dish) => [String(dish.id), dish]));
      const unavailable: string[] = [];
      let added = 0;

      for (const item of reservation.items) {
        const dish = dishById.get(String(item.dishId));
        if (!dish || !dish.isActive || !dish.isAvailable) {
          unavailable.push(item.dishName);
          continue;
        }

        const result = addDish(restaurant, dish, item.quantity ?? 1, "");
        if (result.status === "restaurant-conflict") {
          Alert.alert(
            "Carrito de otro restaurante",
            "Vacía tu carrito actual antes de repetir esta reserva."
          );
          return;
        }
        added += 1;
      }

      if (added === 0) {
        Alert.alert(
          "No disponible",
          "Ningún producto de esta reserva está disponible actualmente."
        );
        return;
      }

      Alert.alert(
        "Agregado al carrito",
        unavailable.length
          ? `Se agregaron los productos disponibles. No disponibles: ${unavailable.join(", ")}.`
          : "Se agregaron los productos disponibles con precios actuales."
      );
    } catch {
      Alert.alert(
        "No se pudo repetir",
        "No pudimos verificar disponibilidad y precios actuales."
      );
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

    if (reservations.length === 0 || reservationRows.length === 0) {
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
              onRate={
                item.reservation.status === "completed"
                  ? () =>
                      navigation.navigate(ROUTES.Rating, {
                        reservation: item.reservation,
                      })
                  : undefined
              }
              onReport={() =>
                navigation.navigate(ROUTES.ProblemReport, {
                  reservationId: item.reservation.id,
                })
              }
              onReorder={() => handleReorder(item.reservation)}
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

      <View style={styles.tabs}>
        {ORDER_TABS.map((tab) => {
          const active = selectedTab === tab.key;

          return (
            <Pressable
              key={tab.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={tab.label}
              onPress={() => setSelectedTab(tab.key)}
              style={styles.tab}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {tab.label}
              </Text>
              <View style={[styles.tabIndicator, active && styles.tabIndicatorActive]} />
            </Pressable>
          );
        })}
      </View>

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
  tabs: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  tab: {
    flex: 1,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacing.xs,
  },
  tabText: {
    color: studentPalette.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
  },
  tabTextActive: {
    color: studentPalette.primary,
    fontWeight: typography.weights.bold,
  },
  tabIndicator: {
    width: "72%",
    height: 3,
    borderRadius: 999,
    backgroundColor: "transparent",
  },
  tabIndicatorActive: {
    backgroundColor: studentPalette.primary,
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
