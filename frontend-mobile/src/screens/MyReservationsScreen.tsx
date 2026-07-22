import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Animated, Easing, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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
import { EmptyState } from "../components";
import { Screen } from "../components/Screen";
import { StudentStatusTone } from "../components/StudentStatusPill";
import { spacing } from "../constants/spacing";
import { STRIPE_PUBLISHABLE_KEY } from "../constants/stripe";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useLocalFeedback } from "../context/LocalFeedbackContext";

import { useNetworkStatus } from "../context/NetworkContext";
import {
  ReservationListItem,
  useReservations,
} from "../hooks/useReservations";
import { useReduceMotion } from "../hooks/useReduceMotion";
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

import type { ReservationStatus } from "../types/models";


type UnknownRecord = Record<string, unknown>;

type Props = NativeStackScreenProps<
  StudentStackParamList,
  typeof ROUTES.MyReservations
>;

type ReservationSectionConfig = {
  key: string;
  title: string;
  statuses: ReservationStatus[];
  tone: StudentStatusTone;
};

type ReservationListRow =
  | {
      type: "section";
      key: string;
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
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  tone: StudentStatusTone;
}> = [
  {
    key: "active",
    label: "Activos",
    statuses: ["pending_payment", "confirmed"],
    iconName: "clock-check-outline",
    tone: "success",
  },
  {
    key: "completed",
    label: "Completados",
    statuses: ["completed"],
    iconName: "check-circle-outline",
    tone: "info",
  },
  {
    key: "cancelled",
    label: "Cancelados",
    statuses: ["cancelled", "expired"],
    iconName: "close-circle-outline",
    tone: "danger",
  },
];

const RESERVATION_SECTIONS: ReservationSectionConfig[] = [
  {
    key: "today",
    title: "Hoy",
    statuses: ["pending_payment", "confirmed", "completed", "cancelled", "expired"],
    tone: "info",
  },
  {
    key: "week",
    title: "Esta semana",
    statuses: ["pending_payment", "confirmed", "completed", "cancelled", "expired"],
    tone: "success",
  },
  {
    key: "month",
    title: "Este mes",
    statuses: ["pending_payment", "confirmed", "completed", "cancelled", "expired"],
    tone: "warning",
  },
  {
    key: "older",
    title: "Anteriores",
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

function getEmptyContent(tab: OrderTabKey) {
  if (tab === "completed") {
    return {
      title: "Aún no tienes pedidos completados",
      message: "Cuando completes una reserva, aparecerá aquí.",
      iconName: "check-circle-outline" as const,
    };
  }

  if (tab === "cancelled") {
    return {
      title: "No tienes reservas canceladas",
      message: "Tus reservas canceladas o expiradas aparecerán aquí.",
      iconName: "close-circle-outline" as const,
    };
  }

  return {
    title: "No tienes reservas activas",
    message: "Explora el menú y reserva tus platos favoritos.",
    iconName: "calendar-clock-outline" as const,
  };
}

export function MyReservationsScreen({
  bottomInset = 0,
}: Partial<Props> & { bottomInset?: number }) {
  const navigation = useNavigation<NativeStackNavigationProp<StudentStackParamList>>();
  const { accessToken } = useAuth();
  const { addDish } = useCart();
  const { hasRatingForReservation } = useLocalFeedback();
  const reduceMotion = useReduceMotion();
  
  const { isOnline } = useNetworkStatus();
  const { reservations, loading, error, reload } = useReservations(accessToken);
  const [isCancelling, setIsCancelling] = useState(false);
  const [payingReservationId, setPayingReservationId] = useState<string | null>(
    null
  );
  const [selectedTab, setSelectedTab] = useState<OrderTabKey>("active");
  const [tabsWidth, setTabsWidth] = useState(0);
  const [reorderingReservationId, setReorderingReservationId] = useState<string | null>(null);
  const selectedTabIndex = ORDER_TABS.findIndex((tab) => tab.key === selectedTab);
  const tabIndicator = useRef(new Animated.Value(Math.max(selectedTabIndex, 0))).current;
  const listOpacity = useRef(new Animated.Value(1)).current;
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  useEffect(() => {
    if (reduceMotion) {
      tabIndicator.setValue(Math.max(selectedTabIndex, 0));
      return;
    }

    Animated.timing(tabIndicator, {
      toValue: Math.max(selectedTabIndex, 0),
      duration: 210,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [reduceMotion, selectedTabIndex, tabIndicator]);

  useEffect(() => {
    if (reduceMotion || loading) {
      listOpacity.setValue(1);
      return;
    }

    listOpacity.setValue(0.96);
    Animated.timing(listOpacity, {
      toValue: 1,
      duration: 160,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [listOpacity, loading, reduceMotion, selectedTab]);

  useFocusEffect(
    useCallback(() => {
      if (!accessToken) {
        return undefined;
      }

      const socket =
        acquireNotificationsSocket(
          accessToken
        );

      const handleDelivered = () => {
        void reload();
      };

      socket.on(
        "reservation_delivered",
        handleDelivered
      );

      return () => {
        socket.off(
          "reservation_delivered",
          handleDelivered
        );

        releaseNotificationsSocket(
          accessToken
        );
      };
    }, [
      accessToken,
      reload,
    ])
  );
  useEffect(() => {
    if (!accessToken || !isOnline) {
      return;
    }

    const hasPendingReservations = reservations.some(
      (reservation) => reservation.status === "pending_payment"
    );

    if (!hasPendingReservations) {
      return;
    }

    const interval = setInterval(() => {
      void reload();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [accessToken, isOnline, reservations, reload]);



  const tabCounts = useMemo(() => {
    return ORDER_TABS.reduce<Record<OrderTabKey, number>>(
      (accumulator, tab) => {
        accumulator[tab.key] = reservations.filter((reservation) =>
          tab.statuses.includes(reservation.status)
        ).length;
        return accumulator;
      },
      { active: 0, completed: 0, cancelled: 0 }
    );
  }, [reservations]);

  const selectedTabConfig =
    ORDER_TABS.find((tab) => tab.key === selectedTab) ?? ORDER_TABS[0];

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
    if (reorderingReservationId) {
      return;
    }

    const restaurantId = reservation.items[0]?.restaurantId;
    if (!restaurantId) {
      Alert.alert("No disponible", "No se pudo identificar el restaurante.");
      return;
    }

    try {
      setReorderingReservationId(reservation.id);
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
    } finally {
      setReorderingReservationId(null);
    }
  };

  const renderContent = () => {
    if (loading && reservations.length === 0) {
      return (
        <ReservationsSkeleton />
      );
    }

    if (error && reservations.length === 0) {
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
      const empty = getEmptyContent(selectedTab);

      return (
        <EmptyState
          title={empty.title}
          message={empty.message}
          iconName={empty.iconName}
          style={styles.feedbackState}
        />
      );
    }

    return (
      <Animated.View style={[styles.list, { opacity: listOpacity }]}>
        <FlatList
          data={reservationRows}
          keyExtractor={(item) => item.key}
          contentContainerStyle={[
            styles.listContent,
            selectedTab === "cancelled" && styles.listContentCompact,
            { paddingBottom: bottomInset + spacing.xxl },
          ]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) =>
            item.type === "section" ? (
            <ReservationSectionHeader
              section={item.section}
              tone={selectedTabConfig.tone}
            />
            ) : (
              <MyReservationCard
                isCancelling={isCancelling}
                isPaymentInProgress={Boolean(payingReservationId)}
                isPaying={payingReservationId === item.reservation.id}
                isRated={hasRatingForReservation(item.reservation.id)}
                isReordering={reorderingReservationId === item.reservation.id}
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
      </Animated.View>
    );
  };

  return (
    <Screen style={styles.container}>
      <MyReservationsHeader
        hasError={Boolean(error)}
        loading={loading}
      />

      <View
        style={styles.tabs}
        onLayout={(event) => setTabsWidth(event.nativeEvent.layout.width)}
      >
        {tabsWidth > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.tabsIndicator,
              getTabIndicatorStyle(selectedTab),
              {
                width: (tabsWidth - 4) / ORDER_TABS.length,
                transform: [
                  {
                    translateX: tabIndicator.interpolate({
                      inputRange: [0, 1, 2],
                      outputRange: [
                        0,
                        (tabsWidth - 4) / ORDER_TABS.length,
                        ((tabsWidth - 4) / ORDER_TABS.length) * 2,
                      ],
                    }),
                  },
                ],
              },
            ]}
          />
        ) : null}
        {ORDER_TABS.map((tab) => {
          const active = selectedTab === tab.key;
          const tabStyle = getTabStyle(tab.key);

          return (
            <Pressable
              key={tab.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={tab.label}
              hitSlop={4}
              onPress={() => setSelectedTab(tab.key)}
              style={styles.tab}
            >
              <View style={styles.tabLabelRow}>
                <MaterialCommunityIcons
                  name={tab.iconName}
                  size={14}
                  color={active ? tabStyle.color : studentPalette.textSecondary}
                />
                <Text
                  style={[
                    styles.tabText,
                    active && { color: tabStyle.color },
                  ]}
                >
                  {tab.label}
                </Text>
                <View
                  style={[
                    styles.tabCount,
                    active && { borderColor: tabStyle.color },
                  ]}
                >
                  <Text
                    style={[
                      styles.tabCountText,
                      active && { color: tabStyle.color },
                    ]}
                  >
                    {tabCounts[tab.key]}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      {renderContent()}
    </Screen>
  );
}

function ReservationSectionHeader({
  section,
  tone,
}: {
  section: ReservationSectionConfig;
  tone: StudentStatusTone;
}) {
  const sectionStyle = getSectionStyle(tone);

  return (
    <View style={styles.statusSection}>
      <View style={[styles.statusAccent, sectionStyle.accent]} />
      <View style={styles.statusSectionText}>
        <Text style={[styles.statusSectionTitle, sectionStyle.title]}>
          {section.title}
        </Text>
      </View>
    </View>
  );
}

function ReservationsSkeleton() {
  return (
    <View style={styles.skeletonStack}>
      {[0, 1].map((item) => (
        <View key={`reservation-skeleton-${item}`} style={styles.skeletonCard}>
          <View style={styles.skeletonImage} />
          <View style={styles.skeletonBody}>
            <View style={styles.skeletonLineLarge} />
            <View style={styles.skeletonLine} />
            <View style={styles.skeletonLineShort} />
          </View>
          <View style={styles.skeletonPill} />
        </View>
      ))}
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
        title: styles.titleDanger,
      };
    case "info":
    default:
      return {
        accent: styles.accentInfo,
        title: styles.titleInfo,
      };
  }
}

function getTabStyle(tab: OrderTabKey) {
  if (tab === "completed") {
    return { color: studentPalette.info };
  }
  if (tab === "cancelled") {
    return { color: studentPalette.danger };
  }
  return { color: studentPalette.success };
}

function getTabIndicatorStyle(tab: OrderTabKey) {
  if (tab === "completed") {
    return styles.tabsIndicatorCompleted;
  }
  if (tab === "cancelled") {
    return styles.tabsIndicatorCancelled;
  }
  return styles.tabIndicatorActive;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: studentPalette.background,
  },
  listContent: {
    gap: 7,
  },
  listContentCompact: {
    gap: 7,
  },
  list: {
    flex: 1,
    backgroundColor: "transparent",
  },
  tabs: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
    marginTop: 2,
    marginBottom: 7,
    padding: 2,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: studentPalette.border,
    backgroundColor: studentPalette.cardMuted,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  tabLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  tabText: {
    color: studentPalette.textSecondary,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: typography.weights.semiBold,
  },
  tabCount: {
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: studentPalette.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: studentPalette.card,
  },
  tabCountText: {
    color: studentPalette.textMuted,
    fontSize: 9.5,
    lineHeight: 12,
    fontWeight: typography.weights.bold,
  },
  tabsIndicator: {
    position: "absolute",
    top: 2,
    bottom: 2,
    left: 2,
    borderRadius: 12,
    opacity: 0.2,
  },
  tabIndicatorActive: {
    backgroundColor: studentPalette.successSoft,
  },
  tabsIndicatorCompleted: {
    backgroundColor: studentPalette.infoSoft,
  },
  tabsIndicatorCancelled: {
    backgroundColor: studentPalette.dangerSoft,
  },
  statusSection: {
    marginTop: 1,
    marginBottom: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  statusAccent: {
    width: 2,
    height: 22,
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
    fontSize: 20,
    fontWeight: typography.weights.bold,
    color: studentPalette.textPrimary,
    lineHeight: 24,
  },
  titleWarning: {
    color: studentPalette.warning,
  },
  titleSuccess: {
    color: studentPalette.success,
  },
  titleInfo: {
    color: studentPalette.info,
  },
  titleDanger: {
    color: studentPalette.danger,
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
  skeletonStack: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  skeletonCard: {
    minHeight: 118,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: studentPalette.border,
    backgroundColor: studentPalette.cardElevated,
    shadowColor: studentPalette.shadow,
    shadowOpacity: 0.8,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  skeletonImage: {
    width: 76,
    height: 70,
    borderRadius: 14,
    backgroundColor: studentPalette.cardMuted,
  },
  skeletonBody: {
    flex: 1,
    gap: spacing.xs,
    paddingTop: 4,
  },
  skeletonLineLarge: {
    width: "80%",
    height: 16,
    borderRadius: 999,
    backgroundColor: studentPalette.cardMuted,
  },
  skeletonLine: {
    width: "62%",
    height: 12,
    borderRadius: 999,
    backgroundColor: studentPalette.cardMuted,
  },
  skeletonLineShort: {
    width: "46%",
    height: 12,
    borderRadius: 999,
    backgroundColor: studentPalette.cardMuted,
  },
  skeletonPill: {
    width: 82,
    height: 24,
    borderRadius: 999,
    backgroundColor: studentPalette.cardMuted,
  },
});
