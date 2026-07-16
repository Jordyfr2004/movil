import React, { useMemo, useState } from "react";
import {
  Animated,
  FlatList,
  ListRenderItemInfo,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import {
  EmptyState,
  ErrorState,
  FilterChip,
  OfflineBanner,
  RestaurantCard,
  ScreenContainer,
  SectionHeader,
  SkeletonCard,
  StatusBadge,
} from "../components";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { spacing } from "../constants/spacing";
import { useAuth } from "../context/AuthContext";
import {
  ReservationListItem,
  useReservations,
} from "../hooks/useReservations";
import { useRestaurants } from "../hooks/useRestaurants";
import { useReduceMotion } from "../hooks/useReduceMotion";
import { ROUTES } from "../navigation/routes";
import { RootStackParamList } from "../navigation/types";
import { designSystem, typography } from "../theme";
import { Restaurant } from "../types/models";

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.Home>;

type HomeContentProps = {
  onOpenRestaurant: (restaurant: Restaurant) => void;
  onOpenOrders?: () => void;
  onOpenExplore?: () => void;
  bottomInset?: number;
};

const QUICK_ACTIONS = [
  {
    key: "short_time",
    label: "Tengo poco tiempo",
    iconName: "timer-outline",
  },
  {
    key: "under_five",
    label: "Menos de $5",
    iconName: "cash",
  },
  {
    key: "today_menu",
    label: "Menú del día",
    iconName: "calendar-today",
  },
  {
    key: "reorder",
    label: "Volver a pedir",
    iconName: "repeat",
  },
] as const;

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Buenos días";
  }

  if (hour < 19) {
    return "Buenas tardes";
  }

  return "Buenas noches";
}

function isNetworkLikeError(error: string | null) {
  if (!error) {
    return false;
  }

  const normalized = error.toLowerCase();
  return (
    normalized.includes("network") ||
    normalized.includes("conectar") ||
    normalized.includes("conexión") ||
    normalized.includes("conexion")
  );
}

function findActiveReservation(reservations: ReservationListItem[]) {
  return reservations.find(
    (reservation) =>
      reservation.status === "confirmed" ||
      reservation.status === "pending_payment"
  );
}

export function HomeScreen({ navigation }: Props) {
  return (
    <HomeContent
      onOpenRestaurant={(restaurant) =>
        navigation.navigate(ROUTES.RestaurantDetail, { restaurant })
      }
      onOpenOrders={() => navigation.navigate(ROUTES.MyReservations)}
    />
  );
}

export function HomeContent({
  onOpenRestaurant,
  onOpenOrders,
  onOpenExplore,
  bottomInset = 0,
}: HomeContentProps) {
  const { restaurants, loading, error, reload } = useRestaurants();
  const { user, accessToken } = useAuth();
  const {
    reservations,
    loading: reservationsLoading,
    reload: reloadReservations,
  } = useReservations(accessToken);
  const reduceMotion = useReduceMotion();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedQuickAction, setSelectedQuickAction] =
    useState<string | null>(null);

  const displayName = useMemo(() => {
    const email = user?.email?.trim();
    if (!email) {
      return "estudiante";
    }

    return email.split("@")[0] || "estudiante";
  }, [user?.email]);

  const activeReservation = useMemo(
    () => findActiveReservation(reservations),
    [reservations]
  );

  const recommendedRestaurants = useMemo(
    () => restaurants.slice(0, 6),
    [restaurants]
  );

  const refresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([reload(), reloadReservations()]);
    } finally {
      setRefreshing(false);
    }
  };

  const renderRestaurant = ({ item, index }: ListRenderItemInfo<Restaurant>) => (
    <RestaurantCard
      restaurant={item}
      index={index}
      onPress={onOpenRestaurant}
    />
  );

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <HomeHero
        activeReservation={activeReservation}
        displayName={displayName}
        onOpenOrders={onOpenOrders}
        reservationsLoading={reservationsLoading}
      />

      <AnimatedSection reduceMotion={reduceMotion}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickActions}
        >
          {QUICK_ACTIONS.map((action) => (
            <FilterChip
              key={action.key}
              label={action.label}
              iconName={action.iconName}
              selected={selectedQuickAction === action.key}
              onPress={() => {
                setSelectedQuickAction((current) =>
                  current === action.key ? null : action.key
                );

                if (action.key === "reorder") {
                  onOpenOrders?.();
                } else if (action.key === "today_menu") {
                  onOpenExplore?.();
                }
              }}
            />
          ))}
        </ScrollView>
      </AnimatedSection>

      <OfflineBanner visible={isNetworkLikeError(error)} />

      {loading ? (
        <View style={styles.skeletonGroup}>
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : null}

      {!loading && !error && recommendedRestaurants.length > 0 ? (
        <AnimatedSection reduceMotion={reduceMotion}>
          <SectionHeader
            title="Recomendados"
            subtitle="Opciones disponibles para revisar ahora"
            actionLabel="Explorar"
            onActionPress={onOpenExplore}
          />
          <FlatList
            data={recommendedRestaurants}
            horizontal
            keyExtractor={(item) => `recommended-${item.id}`}
            renderItem={({ item, index }) => (
              <RestaurantCard
                compact
                variant="featured"
                restaurant={item}
                index={index}
                onPress={onOpenRestaurant}
                style={styles.recommendedCard}
              />
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recommendedList}
          />
        </AnimatedSection>
      ) : null}

      {!loading && !error && restaurants.length > 0 ? (
        <AnimatedSection reduceMotion={reduceMotion}>
          <SectionHeader
            title="Restaurantes"
            subtitle={`${restaurants.length} ${
              restaurants.length === 1 ? "opción" : "opciones"
            } activas`}
          />
        </AnimatedSection>
      ) : null}
    </View>
  );

  return (
    <ScreenContainer
      style={styles.container}
      contentStyle={styles.screenContent}
      bottomInset={bottomInset}
    >
      <FlatList
        style={styles.list}
        data={loading || error ? [] : restaurants}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: bottomInset + spacing.xxl },
        ]}
        ListHeaderComponent={renderHeader}
        renderItem={renderRestaurant}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={designSystem.colors.primary}
            colors={[designSystem.colors.primary]}
          />
        }
        ListEmptyComponent={
          loading ? null : error ? (
            <ErrorState
              title="No se pudieron cargar los restaurantes"
              message={error}
              onRetry={reload}
              style={styles.feedbackState}
            />
          ) : (
            <EmptyState
              title="Sin restaurantes activos"
              message="Cuando haya opciones disponibles aparecerán aquí."
              iconName="store-off-outline"
              actionLabel="Actualizar"
              onActionPress={reload}
              style={styles.feedbackState}
            />
          )
        }
      />
    </ScreenContainer>
  );
}

function HomeHero({
  activeReservation,
  displayName,
  onOpenOrders,
  reservationsLoading,
}: {
  activeReservation?: ReservationListItem;
  displayName: string;
  onOpenOrders?: () => void;
  reservationsLoading: boolean;
}) {
  return (
    <View style={styles.hero}>
      <View style={styles.heroTopRow}>
        <View style={styles.greetingBlock}>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.displayName} numberOfLines={1}>
            {displayName}
          </Text>
        </View>

        <View
          accessibilityRole="button"
          accessibilityLabel="Notificaciones"
          style={styles.notificationButton}
        >
          <MaterialCommunityIcons
            name="bell-outline"
            size={designSystem.iconSizes.md}
            color={designSystem.colors.primary}
          />
        </View>
      </View>

      <Text style={styles.heroTitle}>¿Qué vas a comer hoy?</Text>
      <Text style={styles.heroSubtitle}>
        Encuentra opciones del campus sin perder de vista tus pedidos.
      </Text>

      {!reservationsLoading && activeReservation ? (
        <View style={styles.activeOrder}>
          <View style={styles.activeOrderText}>
            <Text style={styles.activeOrderEyebrow}>Pedido activo</Text>
            <Text style={styles.activeOrderTitle} numberOfLines={1}>
              {activeReservation.title}
            </Text>
            <Text style={styles.activeOrderMeta} numberOfLines={1}>
              {activeReservation.restaurantName}
            </Text>
          </View>
          <FilterChip
            label={
              activeReservation.status === "pending_payment"
                ? "Pagar"
                : "Ver"
            }
            iconName="receipt-text-outline"
            onPress={onOpenOrders}
            selected
          />
        </View>
      ) : null}
    </View>
  );
}

function AnimatedSection({
  children,
  reduceMotion,
}: {
  children: React.ReactNode;
  reduceMotion: boolean;
}) {
  const opacity = React.useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const translateY = React.useRef(new Animated.Value(reduceMotion ? 0 : 12))
    .current;

  React.useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: designSystem.animation.normal,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: designSystem.animation.normal,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, reduceMotion, translateY]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: designSystem.colors.background,
  },
  screenContent: {
    paddingTop: 0,
  },
  listContent: {
    gap: spacing.md,
  },
  list: {
    flex: 1,
    backgroundColor: "transparent",
  },
  headerContent: {
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  hero: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  greetingBlock: {
    flex: 1,
    minWidth: 0,
  },
  greeting: {
    color: designSystem.colors.textSecondary,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    fontWeight: typography.weights.semiBold,
  },
  displayName: {
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.lg,
    lineHeight: typography.lineHeights.lg,
    fontWeight: typography.weights.bold,
  },
  notificationButton: {
    width: 38,
    height: 38,
    borderRadius: designSystem.radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: designSystem.colors.primaryFaint,
  },
  heroTitle: {
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.xl,
    lineHeight: typography.lineHeights.xl,
    fontWeight: typography.weights.bold,
    marginTop: spacing.xs,
  },
  heroSubtitle: {
    color: designSystem.colors.textSecondary,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
  },
  activeOrder: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: designSystem.radii.md,
    backgroundColor: designSystem.colors.surface,
    borderWidth: 1,
    borderColor: "rgba(240, 223, 201, 0.78)",
    ...designSystem.shadows.sm,
  },
  activeOrderText: {
    flex: 1,
    minWidth: 0,
  },
  activeOrderEyebrow: {
    color: designSystem.colors.secondary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  activeOrderTitle: {
    marginTop: spacing.xs,
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  activeOrderMeta: {
    marginTop: spacing.xs,
    color: designSystem.colors.textSecondary,
    fontSize: typography.sizes.sm,
  },
  quickActions: {
    gap: spacing.sm,
    paddingRight: spacing.xxl,
  },
  skeletonGroup: {
    gap: spacing.md,
  },
  recommendedList: {
    paddingTop: spacing.sm,
    paddingRight: spacing.xxl,
  },
  recommendedCard: {
    marginRight: spacing.sm,
  },
  feedbackState: {
    marginTop: spacing.md,
  },
});
