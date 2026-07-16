import React, { useMemo, useState } from "react";
import {
  Animated,
  FlatList,
  ListRenderItemInfo,
  RefreshControl,
  Pressable,
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
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
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
      onOpenNotifications={() => navigation.navigate(ROUTES.Notifications)}
      onOpenProfile={() => navigation.navigate(ROUTES.Profile)}
    />
  );
}

export function HomeContent({
  onOpenRestaurant,
  onOpenOrders,
  onOpenExplore,
  onOpenNotifications,
  onOpenProfile,
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
        onOpenNotifications={onOpenNotifications}
        onOpenOrders={onOpenOrders}
        onOpenProfile={onOpenProfile}
        reservationsLoading={reservationsLoading}
        restaurantCount={restaurants.length}
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
            title="Para comer ahora"
            subtitle="Restaurantes destacados con datos disponibles"
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
            } para revisar`}
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
  onOpenNotifications,
  onOpenOrders,
  onOpenProfile,
  reservationsLoading,
  restaurantCount,
}: {
  activeReservation?: ReservationListItem;
  displayName: string;
  onOpenNotifications?: () => void;
  onOpenOrders?: () => void;
  onOpenProfile?: () => void;
  reservationsLoading: boolean;
  restaurantCount: number;
}) {
  return (
    <View style={styles.hero}>
      <View style={styles.heroBlobLarge} pointerEvents="none" />
      <View style={styles.heroBlobSmall} pointerEvents="none" />
      <View style={styles.heroTopRow}>
        <View style={styles.greetingBlock}>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.displayName} numberOfLines={1}>
            {displayName}
          </Text>
        </View>

        <View style={styles.heroActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Notificaciones"
          onPress={onOpenNotifications}
          style={styles.notificationButton}
        >
          <MaterialCommunityIcons
            name="bell-outline"
            size={designSystem.iconSizes.md}
            color={designSystem.colors.primary}
          />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Perfil"
          onPress={onOpenProfile}
          style={styles.profileButton}
        >
          <MaterialCommunityIcons
            name="account-circle-outline"
            size={designSystem.iconSizes.md}
            color={designSystem.colors.secondary}
          />
        </Pressable>
        </View>
      </View>

      <Text style={styles.heroTitle}>¿Qué vas a comer hoy?</Text>
      <Text style={styles.heroSubtitle}>
        Encuentra opciones del campus sin perder de vista tus pedidos.
      </Text>

      <View style={styles.dailySummary}>
        <View style={styles.summaryPill}>
          <MaterialCommunityIcons
            name="storefront-outline"
            size={designSystem.iconSizes.sm}
            color={designSystem.colors.primary}
          />
          <Text style={styles.summaryPillText}>
            {restaurantCount} {restaurantCount === 1 ? "restaurante" : "restaurantes"}
          </Text>
        </View>
        <View style={styles.summaryPill}>
          <MaterialCommunityIcons
            name="lightning-bolt-outline"
            size={designSystem.iconSizes.sm}
            color={designSystem.colors.secondary}
          />
          <Text style={styles.summaryPillText}>Pide en minutos</Text>
        </View>
      </View>

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
    gap: spacing.lg,
  },
  list: {
    flex: 1,
    backgroundColor: "transparent",
  },
  headerContent: {
    gap: spacing.lg,
    paddingTop: spacing.sm,
  },
  hero: {
    position: "relative",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: designSystem.radii.xl,
    overflow: "hidden",
    backgroundColor: designSystem.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
    ...designSystem.shadows.medium,
  },
  heroBlobLarge: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 999,
    right: -58,
    top: -70,
    backgroundColor: designSystem.colors.primarySoft,
    opacity: 0.46,
  },
  heroBlobSmall: {
    position: "absolute",
    width: 86,
    height: 86,
    borderRadius: 999,
    left: -28,
    bottom: -34,
    backgroundColor: designSystem.colors.secondarySoft,
    opacity: 0.72,
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
  heroActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  greeting: {
    color: designSystem.colors.textSecondary,
    fontSize: typography.roles.label.fontSize,
    lineHeight: typography.roles.label.lineHeight,
    fontWeight: typography.weights.semiBold,
  },
  displayName: {
    color: designSystem.colors.textPrimary,
    fontSize: typography.roles.cardTitle.fontSize,
    lineHeight: typography.roles.cardTitle.lineHeight,
    fontWeight: typography.roles.cardTitle.fontWeight,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: designSystem.radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: designSystem.colors.surface,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: designSystem.radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: designSystem.colors.secondarySoft,
    borderWidth: 1,
    borderColor: designSystem.colors.divider,
  },
  heroTitle: {
    color: designSystem.colors.textPrimary,
    fontSize: typography.roles.heroTitle.fontSize,
    lineHeight: typography.roles.heroTitle.lineHeight,
    fontWeight: typography.roles.heroTitle.fontWeight,
  },
  heroSubtitle: {
    color: designSystem.colors.textSecondary,
    fontSize: typography.roles.bodySmall.fontSize,
    lineHeight: typography.roles.bodySmall.lineHeight,
    maxWidth: 310,
  },
  dailySummary: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  summaryPill: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: designSystem.radii.pill,
    backgroundColor: designSystem.colors.surface,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
  },
  summaryPillText: {
    color: designSystem.colors.textSecondary,
    fontSize: typography.roles.caption.fontSize,
    fontWeight: typography.weights.semiBold,
  },
  activeOrder: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: designSystem.radii.lg,
    backgroundColor: designSystem.colors.surface,
    borderWidth: 1,
    borderColor: designSystem.colors.primarySoft,
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
