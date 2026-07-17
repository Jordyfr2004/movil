import React, { useEffect, useMemo, useState } from "react";
import {
  Animated,
  AppState,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import {
  EmptyState,
  ErrorState,
  OfflineBanner,
  ScreenContainer,
  SkeletonCard,
} from "../components";
import { spacing } from "../constants/spacing";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import { useLocalNotifications } from "../context/LocalNotificationsContext";
import {
  ReservationListItem,
  useReservations,
} from "../hooks/useReservations";
import { useRestaurants } from "../hooks/useRestaurants";
import { useReduceMotion } from "../hooks/useReduceMotion";
import { useThemeColors } from "../hooks/useThemeColors";
import { ROUTES } from "../navigation/routes";
import { RootStackParamList } from "../navigation/types";
import { Dish, getPublicDishesByRestaurant } from "../services/dishService";
import { designSystem, typography } from "../theme";
import { Restaurant } from "../types/models";
import {
  getDishImageSource,
  getRestaurantImageSource,
} from "../utils/foodImages";

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.Home>;

type HomeContentProps = {
  onOpenRestaurant: (restaurant: Restaurant) => void;
  onOpenDish?: (restaurant: Restaurant, dish: Dish) => void;
  onOpenOrders?: () => void;
  onOpenExplore?: () => void;
  onOpenNotifications?: () => void;
  bottomInset?: number;
};

type CategoryShortcut = {
  key: string;
  label: string;
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  onPress?: () => void;
};

type RestaurantStatus = {
  label: string;
  color: string;
  backgroundColor: string;
};

type HomeDishItem = {
  key: string;
  restaurant: Restaurant;
  dish: Dish;
};

function getGreeting(date = new Date()) {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) return "Buenos días";
  if (hour >= 12 && hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

function formatDisplayName(value?: string | null) {
  const fallback = "estudiante";
  const raw = value?.trim();
  const base = raw ? raw.split("@")[0] || fallback : fallback;

  const formatted = base
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

  return formatted.split(" ")[0] || fallback;
}

function useLocalGreeting() {
  const [greeting, setGreeting] = useState(() => getGreeting());

  useEffect(() => {
    const updateGreeting = () => {
      const nextGreeting = getGreeting();
      setGreeting((current) =>
        current === nextGreeting ? current : nextGreeting
      );
    };

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        updateGreeting();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return greeting;
}

function isNetworkLikeError(error: string | null) {
  if (!error) return false;

  const normalized = error.toLowerCase();
  return (
    normalized.includes("network") ||
    normalized.includes("conectar") ||
    normalized.includes("conexion") ||
    normalized.includes("conexión")
  );
}

function findActiveReservation(reservations: ReservationListItem[]) {
  return reservations.find(
    (reservation) =>
      reservation.status === "confirmed" ||
      reservation.status === "pending_payment"
  );
}

function parseTimeToMinutes(value?: string) {
  const match = value?.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;

  return hours * 60 + minutes;
}

function formatTime(value?: string) {
  const match = value?.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;

  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

function getRestaurantStatus(
  restaurant: Restaurant,
  theme: ReturnType<typeof useThemeColors>
): RestaurantStatus {
  if (!restaurant.isActive) {
    return {
      label: "Cerrado",
      color: theme.danger,
      backgroundColor: theme.dangerSoft,
    };
  }

  const opening = parseTimeToMinutes(restaurant.openingTime);
  const closing = parseTimeToMinutes(restaurant.closingTime);

  if (opening === null || closing === null) {
    return {
      label: "Disponible",
      color: theme.neutral,
      backgroundColor: theme.neutralSoft,
    };
  }

  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  const isOpen =
    closing > opening
      ? current >= opening && current <= closing
      : current >= opening || current <= closing;

  return isOpen
    ? {
        label: "Abierto",
        color: theme.success,
        backgroundColor: theme.successSoft,
      }
    : {
        label: "Cerrado",
        color: theme.danger,
        backgroundColor: theme.dangerSoft,
      };
}

function getRestaurantMeta(restaurant: Restaurant) {
  const opening = formatTime(restaurant.openingTime);
  const closing = formatTime(restaurant.closingTime);

  if (opening && closing) return `${opening} - ${closing}`;
  if (restaurant.location) return restaurant.location;
  if (restaurant.description) return restaurant.description;
  return null;
}

function getReservationTime(reservation: ReservationListItem) {
  const date = new Date(reservation.reservationDate);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleTimeString("es-EC", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function HomeScreen({ navigation }: Props) {
  return (
    <HomeContent
      onOpenRestaurant={(restaurant) =>
        navigation.navigate(ROUTES.RestaurantDetail, { restaurant })
      }
      onOpenDish={(restaurant, dish) =>
        navigation.navigate(ROUTES.FoodDetail, { restaurant, dish })
      }
      onOpenOrders={() => navigation.navigate(ROUTES.MyReservations)}
      onOpenNotifications={() => navigation.navigate(ROUTES.Notifications)}
    />
  );
}

export function HomeContent({
  onOpenDish,
  onOpenRestaurant,
  onOpenOrders,
  onOpenExplore,
  onOpenNotifications,
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
  const theme = useThemeColors();
  const greeting = useLocalGreeting();
  const { unreadCount } = useLocalNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const [dishItems, setDishItems] = useState<HomeDishItem[]>([]);

  const displayName = useMemo(
    () => formatDisplayName(user?.email),
    [user?.email]
  );

  const activeReservation = useMemo(
    () => findActiveReservation(reservations),
    [reservations]
  );

  const restaurantById = useMemo(() => {
    return new Map(restaurants.map((restaurant) => [String(restaurant.id), restaurant]));
  }, [restaurants]);

  const heroRestaurant = restaurants[0];

  const categoryShortcuts = useMemo<CategoryShortcut[]>(
    () => [
      {
        key: "menu",
        label: "Menú",
        iconName: "silverware-fork-knife",
        onPress: onOpenExplore,
      },
      {
        key: "open",
        label: "Abiertos",
        iconName: "store-clock-outline",
        onPress: onOpenExplore,
      },
      {
        key: "dishes",
        label: "Platos",
        iconName: "food-outline",
        onPress: onOpenExplore,
      },
      {
        key: "restaurants",
        label: "Restaurantes",
        iconName: "storefront-outline",
        onPress: onOpenExplore,
      },
      {
        key: "budget",
        label: "Económicos",
        iconName: "cash",
        onPress: onOpenExplore,
      },
    ],
    [onOpenExplore]
  );

  const refresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([reload(), reloadReservations()]);
    } finally {
      setRefreshing(false);
    }
  };

  const activeReservationRestaurant =
    activeReservation?.items?.[0]?.restaurantId
      ? restaurantById.get(String(activeReservation.items[0].restaurantId))
      : undefined;

  const restaurantsKey = useMemo(
    () => restaurants.map((restaurant) => String(restaurant.id)).join("|"),
    [restaurants]
  );

  useEffect(() => {
    let cancelled = false;

    if (restaurants.length === 0) {
      setDishItems((current) => (current.length === 0 ? current : []));
      return () => {
        cancelled = true;
      };
    }

    const loadHomeDishes = async () => {
      const settled = await Promise.allSettled(
        restaurants.slice(0, 4).map(async (restaurant) => {
          const dishes = await getPublicDishesByRestaurant(String(restaurant.id));
          return dishes
            .filter((dish) => dish.isActive && dish.isAvailable)
            .slice(0, 2)
            .map((dish) => ({
              key: `${restaurant.id}-${dish.id}`,
              restaurant,
              dish,
            }));
        })
      );

      if (cancelled) return;

      const nextItems = settled
        .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
        .slice(0, 8);

      setDishItems((current) => {
        const currentKey = current.map((item) => item.key).join("|");
        const nextKey = nextItems.map((item) => item.key).join("|");
        return currentKey === nextKey ? current : nextItems;
      });
    };

    void loadHomeDishes();

    return () => {
      cancelled = true;
    };
  }, [restaurants, restaurantsKey]);

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <HomeHeader
        displayName={displayName}
        greeting={greeting}
        onOpenExplore={onOpenExplore}
        onOpenNotifications={onOpenNotifications}
        unreadNotifications={unreadCount}
      />

      {!reservationsLoading && activeReservation ? (
        <AnimatedSection reduceMotion={reduceMotion}>
          <ActiveOrderCard
            reservation={activeReservation}
            restaurant={activeReservationRestaurant}
            onOpenOrders={onOpenOrders}
          />
        </AnimatedSection>
      ) : null}

      <AnimatedSection reduceMotion={reduceMotion}>
        <HomeHero
          featuredRestaurant={heroRestaurant}
          restaurantCount={restaurants.length}
          onOpenRestaurant={onOpenRestaurant}
        />
      </AnimatedSection>

      <AnimatedSection reduceMotion={reduceMotion}>
        <HomeCategories shortcuts={categoryShortcuts} />
      </AnimatedSection>

      <OfflineBanner visible={isNetworkLikeError(error)} />

      {loading ? (
        <View style={styles.skeletonGroup}>
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : null}

      {!loading && !error && restaurants.length > 0 ? (
        <AnimatedSection reduceMotion={reduceMotion}>
          <SectionTitle
            title="Restaurantes disponibles"
            actionLabel="Ver todos"
            onActionPress={onOpenExplore}
          />
          <FlatList
            data={restaurants}
            horizontal
            keyExtractor={(item) => `restaurant-${item.id}`}
            renderItem={({ item, index }) => (
              <FeaturedRestaurantCard
                restaurant={item}
                index={index}
                onPress={() => onOpenRestaurant(item)}
              />
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
          />
        </AnimatedSection>
      ) : null}

      {!loading && !error && dishItems.length > 0 ? (
        <AnimatedSection reduceMotion={reduceMotion}>
          <SectionTitle
            title="Platos para ti"
            actionLabel={onOpenExplore ? "Ver todos" : undefined}
            onActionPress={onOpenExplore}
          />
          <FlatList
            data={dishItems}
            horizontal
            keyExtractor={(item) => item.key}
            renderItem={({ item, index }) => (
              <HomeDishCard
                item={item}
                index={index}
                onPress={() => onOpenDish?.(item.restaurant, item.dish)}
              />
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
          />
        </AnimatedSection>
      ) : null}

    </View>
  );

  return (
    <ScreenContainer
      style={[styles.container, { backgroundColor: theme.background }]}
      contentStyle={styles.screenContent}
      bottomInset={bottomInset}
    >
      <FlatList<Restaurant>
        style={styles.list}
        data={[]}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: bottomInset + spacing.xs },
        ]}
        ListHeaderComponent={renderHeader}
        renderItem={() => null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
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
          ) : restaurants.length === 0 ? (
            <EmptyState
              title="Sin restaurantes activos"
              message="Cuando haya opciones disponibles aparecerán aquí."
              iconName="store-off-outline"
              actionLabel="Actualizar"
              onActionPress={reload}
              style={styles.feedbackState}
            />
          ) : null
        }
      />
    </ScreenContainer>
  );
}

function HomeHeader({
  displayName,
  greeting,
  onOpenExplore,
  onOpenNotifications,
  unreadNotifications,
}: {
  displayName: string;
  greeting: string;
  onOpenExplore?: () => void;
  onOpenNotifications?: () => void;
  unreadNotifications: number;
}) {
  const theme = useThemeColors();

  return (
    <View style={styles.headerRow}>
      <View style={styles.greetingBlock}>
        <Text style={[styles.displayName, { color: theme.textPrimary }]}>
          {greeting}, {displayName}
        </Text>
        <Text style={[styles.greeting, { color: theme.textSecondary }]}>
          ¿Qué vas a comer hoy?
        </Text>
      </View>

      <View style={styles.headerActions}>
        {onOpenExplore ? (
          <IconButton
            iconName="magnify"
            label="Buscar"
            onPress={onOpenExplore}
          />
        ) : null}
        <IconButton
          iconName="bell-outline"
          label="Notificaciones"
          onPress={onOpenNotifications}
          showDot={unreadNotifications > 0}
        />
      </View>
    </View>
  );
}

function IconButton({
  iconName,
  label,
  onPress,
  showDot = false,
}: {
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  onPress?: () => void;
  showDot?: boolean;
}) {
  const theme = useThemeColors();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.headerIconButton,
        { backgroundColor: theme.primaryFaint, borderColor: theme.primarySoft },
        pressed && onPress && styles.pressed,
        !onPress && styles.disabled,
      ]}
    >
      <MaterialCommunityIcons
        name={iconName}
        size={24}
        color={theme.primary}
      />
      {showDot ? <View style={[styles.notificationDot, { backgroundColor: theme.primary }]} /> : null}
    </Pressable>
  );
}

function HomeHero({
  featuredRestaurant,
  onOpenRestaurant,
  restaurantCount,
}: {
  featuredRestaurant?: Restaurant;
  onOpenRestaurant: (restaurant: Restaurant) => void;
  restaurantCount: number;
}) {
  const theme = useThemeColors();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        featuredRestaurant
          ? `Ver restaurante ${featuredRestaurant.name}`
          : "Explorar restaurantes"
      }
      disabled={!featuredRestaurant}
      onPress={() => featuredRestaurant && onOpenRestaurant(featuredRestaurant)}
      style={({ pressed }) => [
        styles.hero,
        { backgroundColor: theme.surfaceElevated },
        pressed && featuredRestaurant && styles.heroPressed,
      ]}
    >
      <Image
        source={getRestaurantImageSource(featuredRestaurant)}
        style={styles.heroImage}
        resizeMode="cover"
      />
      <View style={styles.heroScrim} />
      <View style={styles.heroLeftScrim} />
      <View style={styles.heroCopy}>
        <Text style={styles.heroEyebrow}>Restaurante destacado</Text>
        <Text style={styles.heroTitle} numberOfLines={1}>
          {featuredRestaurant?.name ?? `${restaurantCount} restaurantes disponibles`}
        </Text>
        <Text style={styles.heroSubtitle} numberOfLines={2}>
          {featuredRestaurant?.description ||
            featuredRestaurant?.location ||
            "Explora opciones reales del campus"}
        </Text>
        <View style={styles.heroCta}>
          <Text style={styles.heroCtaText}>Ver menú</Text>
        </View>
      </View>
    </Pressable>
  );
}

function ActiveOrderCard({
  reservation,
  restaurant,
  onOpenOrders,
}: {
  reservation: ReservationListItem;
  restaurant?: Restaurant;
  onOpenOrders?: () => void;
}) {
  const theme = useThemeColors();
  const reservationTime = getReservationTime(reservation);
  const statusLabel =
    reservation.status === "pending_payment" ? "Pago pendiente" : "Confirmado";

  return (
    <View style={styles.activeOrderSection}>
      <SectionTitle
        title="Tu pedido activo"
        actionLabel="Ver todos"
        onActionPress={onOpenOrders}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ver seguimiento del pedido activo"
        onPress={onOpenOrders}
        style={({ pressed }) => [
          styles.activeOrder,
          { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
          pressed && onOpenOrders && styles.pressed,
        ]}
      >
        <View style={styles.activeOrderThumb}>
          <Image
            source={getRestaurantImageSource(restaurant)}
            style={styles.activeOrderFallback}
            resizeMode="cover"
          />
        </View>
        <View style={styles.activeOrderText}>
          <Text style={[styles.activeOrderStatus, { color: theme.primary }]} numberOfLines={1}>
            {statusLabel}
          </Text>
          <Text
            style={[styles.activeOrderTitle, { color: theme.textPrimary }]}
            numberOfLines={1}
          >
            {reservation.restaurantName}
          </Text>
          <Text
            style={[styles.activeOrderMeta, { color: theme.textSecondary }]}
            numberOfLines={1}
          >
            {reservation.title}
            {reservationTime ? ` · ${reservationTime}` : ""}
          </Text>
        </View>
        <View style={[styles.trackingButton, { borderColor: theme.primarySoft }]}>
          <Text style={[styles.trackingText, { color: theme.primary }]}>
            Ver seguimiento
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

function HomeCategories({
  shortcuts,
}: {
  shortcuts: CategoryShortcut[];
}) {
  return (
    <View style={styles.categoriesSection}>
      <SectionTitle title="Accesos rápidos" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
      >
        {shortcuts.map((shortcut) => (
          <CategoryShortcutItem key={shortcut.key} shortcut={shortcut} />
        ))}
      </ScrollView>
    </View>
  );
}

function CategoryShortcutItem({ shortcut }: { shortcut: CategoryShortcut }) {
  const theme = useThemeColors();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={shortcut.label}
      onPress={shortcut.onPress}
      disabled={!shortcut.onPress}
      style={({ pressed }) => [
        styles.categoryItem,
        pressed && shortcut.onPress && styles.pressed,
        !shortcut.onPress && styles.disabled,
      ]}
    >
      <View style={[styles.categoryIcon, { backgroundColor: theme.primaryFaint }]}>
        <MaterialCommunityIcons
          name={shortcut.iconName}
          size={23}
          color={theme.primary}
        />
      </View>
      <Text style={[styles.categoryLabel, { color: theme.textSecondary }]}>
        {shortcut.label}
      </Text>
    </Pressable>
  );
}

function SectionTitle({
  actionLabel,
  onActionPress,
  subtitle,
  title,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
}) {
  const theme = useThemeColors();

  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionText}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {actionLabel && onActionPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onActionPress}
          style={styles.sectionAction}
        >
          <Text style={[styles.sectionActionText, { color: theme.primary }]}>
            {actionLabel}
          </Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={18}
            color={theme.primary}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

function FeaturedRestaurantCard({
  index,
  onPress,
  restaurant,
}: {
  index: number;
  restaurant: Restaurant;
  onPress: () => void;
}) {
  const theme = useThemeColors();
  const reduceMotion = useReduceMotion();
  const opacity = React.useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const translateY = React.useRef(new Animated.Value(reduceMotion ? 0 : 12)).current;
  const status = getRestaurantStatus(restaurant, theme);
  const { isRestaurantFavorite, toggleRestaurant } = useFavorites();
  const favorite = isRestaurantFavorite(restaurant.id);

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
        delay: Math.min(index * 35, 150),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: designSystem.animation.normal,
        delay: Math.min(index * 35, 150),
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, opacity, reduceMotion, translateY]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver restaurante ${restaurant.name}`}
        onPress={onPress}
        style={({ pressed }) => [
          styles.featuredCard,
          { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.featuredMedia}>
          <Image
            source={getRestaurantImageSource(restaurant)}
            style={styles.restaurantFallback}
            resizeMode="cover"
          />
          <FavoriteButton
            favorite={favorite}
            onPress={() => toggleRestaurant(restaurant)}
          />
        </View>
        <View style={styles.featuredBody}>
          <Text
            style={[styles.restaurantName, { color: theme.textPrimary }]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {restaurant.name}
          </Text>
          {getRestaurantMeta(restaurant) ? (
            <Text style={[styles.restaurantMeta, { color: theme.textSecondary }]} numberOfLines={1}>
              {getRestaurantMeta(restaurant)}
            </Text>
          ) : null}
          <View style={styles.cardStatusRow}>
            <View style={[styles.statusDot, { backgroundColor: status.color }]} />
            <Text style={[styles.statusText, { color: status.color }]} numberOfLines={1}>
              {status.label}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function HomeDishCard({
  index,
  item,
  onPress,
}: {
  index: number;
  item: HomeDishItem;
  onPress?: () => void;
}) {
  const theme = useThemeColors();
  const { isDishFavorite, toggleDish } = useFavorites();
  const favorite = isDishFavorite(item.dish.id);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver plato ${item.dish.name}`}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.dishCard,
        { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
        pressed && onPress && styles.pressed,
      ]}
    >
      <View style={styles.dishMedia}>
        <Image
          source={getDishImageSource(item.dish, item.restaurant)}
          style={styles.fullImage}
          resizeMode="cover"
        />
        <FavoriteButton
          favorite={favorite}
          onPress={() => toggleDish(item.restaurant, item.dish)}
        />
      </View>
      <View style={styles.dishBody}>
        <Text
          style={[styles.restaurantName, { color: theme.textPrimary }]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {item.dish.name}
        </Text>
        <Text style={[styles.restaurantMeta, { color: theme.textSecondary }]} numberOfLines={1}>
          {item.restaurant.name}
        </Text>
        <Text style={[styles.dishPrice, { color: theme.primary }]} numberOfLines={1}>
          ${item.dish.price}
        </Text>
      </View>
    </Pressable>
  );
}

function CompactRestaurantRow({
  index,
  onPress,
  restaurant,
}: {
  index: number;
  restaurant: Restaurant;
  onPress: () => void;
}) {
  const theme = useThemeColors();
  const status = getRestaurantStatus(restaurant, theme);
  const { isRestaurantFavorite, toggleRestaurant } = useFavorites();
  const favorite = isRestaurantFavorite(restaurant.id);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver restaurante ${restaurant.name}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.compactRow,
        { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.compactImage}>
        {restaurant.imageUrl ? (
          <Image
            source={{ uri: restaurant.imageUrl }}
            style={styles.fullImage}
            resizeMode="cover"
          />
        ) : (
          <Image
            source={getRestaurantImageSource(restaurant)}
            style={styles.rowFallback}
            resizeMode="cover"
          />
        )}
      </View>
      <View style={styles.compactText}>
        <Text
          style={[styles.compactName, { color: theme.textPrimary }]}
          numberOfLines={1}
        >
          {restaurant.name}
        </Text>
        {getRestaurantMeta(restaurant) ? (
          <Text style={[styles.restaurantMeta, { color: theme.textSecondary }]} numberOfLines={1}>
            {getRestaurantMeta(restaurant)}
          </Text>
        ) : null}
        <View style={[styles.inlineStatus, { backgroundColor: status.backgroundColor }]}>
          <View style={[styles.statusDot, { backgroundColor: status.color }]} />
          <Text style={[styles.statusText, { color: status.color }]} numberOfLines={1}>
            {status.label}
          </Text>
        </View>
      </View>
      <FavoriteButton
        favorite={favorite}
        onPress={() => toggleRestaurant(restaurant)}
      />
      <MaterialCommunityIcons
        name="chevron-right"
        size={22}
        color={theme.textMuted}
      />
    </Pressable>
  );
}

function FavoriteButton({
  favorite,
  onPress,
}: {
  favorite: boolean;
  onPress: () => void;
}) {
  const theme = useThemeColors();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={favorite ? "Quitar de favoritos" : "Guardar en favoritos"}
      onPress={(event) => {
        event.stopPropagation();
        onPress();
      }}
      style={({ pressed }) => [
        styles.favoriteButton,
        { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
        pressed && styles.pressed,
      ]}
    >
      <MaterialCommunityIcons
        name={favorite ? "heart" : "heart-outline"}
        size={22}
        color={theme.primary}
      />
    </Pressable>
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
    paddingTop: spacing.xs,
    paddingBottom: 0,
  },
  list: {
    flex: 1,
    backgroundColor: "transparent",
  },
  listContent: {
    gap: spacing.xs,
  },
  headerContent: {
    gap: spacing.md,
  },
  headerRow: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  greetingBlock: {
    flex: 1,
    minWidth: 0,
  },
  displayName: {
    fontSize: 25,
    lineHeight: 31,
    fontWeight: typography.weights.extraBold,
  },
  greeting: {
    marginTop: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: typography.weights.semiBold,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: designSystem.radii.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    ...designSystem.shadows.low,
  },
  notificationDot: {
    position: "absolute",
    top: 9,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 999,
  },
  hero: {
    position: "relative",
    height: 176,
    borderRadius: 18,
    overflow: "hidden",
    ...designSystem.shadows.medium,
  },
  heroPressed: {
    transform: [{ scale: 0.99 }],
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  heroScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(36, 22, 12, 0.34)",
  },
  heroLeftScrim: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "68%",
    backgroundColor: "rgba(22, 14, 8, 0.48)",
  },
  heroCopy: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-start",
    padding: spacing.md,
    gap: 4,
  },
  heroEyebrow: {
    color: "#FFF5EA",
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    fontWeight: typography.weights.bold,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    lineHeight: 27,
    fontWeight: typography.weights.extraBold,
    maxWidth: "82%",
  },
  heroSubtitle: {
    color: "#FFF1E2",
    fontSize: typography.roles.bodySmall.fontSize,
    lineHeight: typography.roles.bodySmall.lineHeight,
    maxWidth: "82%",
  },
  heroCta: {
    marginTop: spacing.xs,
    minHeight: 38,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    borderRadius: designSystem.radii.pill,
    backgroundColor: designSystem.colors.primary,
  },
  heroCtaText: {
    color: designSystem.colors.textInverted,
    fontSize: typography.roles.button.fontSize,
    fontWeight: typography.weights.bold,
  },
  activeOrderSection: {
    gap: spacing.sm,
  },
  activeOrder: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: 18,
    borderWidth: 1,
    ...designSystem.shadows.low,
  },
  activeOrderThumb: {
    width: 52,
    height: 52,
    borderRadius: 12,
    overflow: "hidden",
  },
  activeOrderFallback: {
    width: 52,
    height: 52,
    borderRadius: 12,
  },
  activeOrderText: {
    flex: 1,
    minWidth: 0,
  },
  activeOrderStatus: {
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    fontWeight: typography.weights.bold,
  },
  activeOrderTitle: {
    marginTop: 2,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    fontWeight: typography.weights.bold,
  },
  activeOrderMeta: {
    marginTop: 1,
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
  },
  trackingButton: {
    minHeight: 32,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
    borderRadius: designSystem.radii.pill,
    borderWidth: 1,
  },
  trackingText: {
    fontSize: typography.sizes.xs,
    lineHeight: typography.lineHeights.xs,
    fontWeight: typography.weights.bold,
  },
  categoriesSection: {
    gap: spacing.sm,
  },
  categoriesList: {
    gap: spacing.sm,
    paddingRight: spacing.xxxl,
  },
  categoryItem: {
    width: 86,
    alignItems: "center",
    gap: spacing.xs,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryLabel: {
    width: "100%",
    textAlign: "center",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: typography.weights.bold,
  },
  sectionHeader: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  sectionText: {
    flex: 1,
    minWidth: 0,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: typography.weights.extraBold,
  },
  sectionSubtitle: {
    marginTop: 2,
    fontSize: typography.roles.bodySmall.fontSize,
    lineHeight: typography.roles.bodySmall.lineHeight,
  },
  sectionAction: {
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
  },
  sectionActionText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  featuredList: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
    paddingRight: spacing.xxxl,
  },
  featuredCard: {
    width: 148,
    height: 176,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    ...designSystem.shadows.low,
  },
  featuredMedia: {
    height: 96,
    margin: spacing.xs,
    marginBottom: 0,
    borderRadius: 14,
    overflow: "hidden",
  },
  featuredBody: {
    flex: 1,
    justifyContent: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: 2,
  },
  restaurantName: {
    fontSize: 14,
    lineHeight: 17,
    height: 34,
    fontWeight: typography.weights.extraBold,
    textTransform: "capitalize",
  },
  restaurantMeta: {
    fontSize: 11,
    lineHeight: 13,
    height: 13,
    fontWeight: typography.weights.semiBold,
  },
  restaurantFallback: {
    width: "100%",
    height: "100%",
    borderRadius: 14,
    borderWidth: 0,
  },
  dishCard: {
    width: 148,
    height: 180,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    ...designSystem.shadows.low,
  },
  dishMedia: {
    height: 96,
    margin: spacing.xs,
    marginBottom: 0,
    borderRadius: 14,
    overflow: "hidden",
  },
  dishBody: {
    flex: 1,
    justifyContent: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: 2,
  },
  dishPrice: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: typography.weights.extraBold,
  },
  cardStatusRow: {
    minHeight: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  inlineStatus: {
    alignSelf: "flex-start",
    minHeight: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: designSystem.radii.pill,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: typography.weights.bold,
  },
  favoriteButton: {
    position: "absolute",
    top: spacing.xs,
    right: spacing.xs,
    width: 40,
    height: 40,
    borderRadius: designSystem.radii.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    ...designSystem.shadows.low,
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
  compactRow: {
    minHeight: 92,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: 18,
    borderWidth: 1,
    ...designSystem.shadows.low,
  },
  compactImage: {
    width: 78,
    height: 68,
    borderRadius: 16,
    overflow: "hidden",
  },
  rowFallback: {
    width: 78,
    height: 68,
    borderRadius: 16,
    borderWidth: 0,
  },
  compactText: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  compactName: {
    fontSize: typography.roles.cardTitle.fontSize,
    lineHeight: typography.roles.cardTitle.lineHeight,
    fontWeight: typography.weights.extraBold,
    textTransform: "capitalize",
  },
  skeletonGroup: {
    gap: spacing.md,
  },
  feedbackState: {
    marginTop: spacing.md,
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.6,
  },
});
