import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  EmptyState,
  ErrorState,
  FilterChip,
  RestaurantCard,
  ScreenContainer,
  SectionHeader,
  SkeletonCard,
} from "../components";
import { spacing } from "../constants/spacing";
import { useRestaurants } from "../hooks/useRestaurants";
import { useReduceMotion } from "../hooks/useReduceMotion";
import { MyReservationsScreen } from "../screens/MyReservationsScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { HomeContent } from "../screens/HomeScreen";
import { designSystem, typography } from "../theme";
import { Restaurant } from "../types/models";
import { ROUTES } from "./routes";
import { StudentStackParamList } from "./types";

type Props = NativeStackScreenProps<StudentStackParamList, typeof ROUTES.Home>;

type TabKey = "home" | "explore" | "orders" | "favorites" | "profile";

const TAB_BAR_HEIGHT = 58;

const TABS: Array<{
  key: TabKey;
  label: string;
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
}> = [
  { key: "home", label: "Inicio", iconName: "home-variant-outline" },
  { key: "explore", label: "Explorar", iconName: "compass-outline" },
  { key: "orders", label: "Pedidos", iconName: "receipt-text-outline" },
  { key: "favorites", label: "Favoritos", iconName: "heart-outline" },
  { key: "profile", label: "Perfil", iconName: "account-outline" },
];

export function StudentMainTabs({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const insets = useSafeAreaInsets();
  const tabBottomPadding = Math.max(insets.bottom, spacing.xs);
  const bottomInset = TAB_BAR_HEIGHT + tabBottomPadding + spacing.md;

  const openRestaurant = (restaurant: Restaurant) => {
    navigation.navigate(ROUTES.RestaurantDetail, { restaurant });
  };

  return (
    <View style={styles.container}>
      <TabScene activeTab={activeTab}>
        {activeTab === "home" ? (
          <HomeContent
            bottomInset={bottomInset}
            onOpenExplore={() => setActiveTab("explore")}
            onOpenOrders={() => setActiveTab("orders")}
            onOpenRestaurant={openRestaurant}
          />
        ) : null}

        {activeTab === "explore" ? (
          <ExploreTab
            bottomInset={bottomInset}
            onOpenRestaurant={openRestaurant}
          />
        ) : null}

        {activeTab === "orders" ? (
          <MyReservationsScreen bottomInset={bottomInset} />
        ) : null}

        {activeTab === "favorites" ? (
          <FavoritesTab
            bottomInset={bottomInset}
            onExplore={() => setActiveTab("explore")}
          />
        ) : null}

        {activeTab === "profile" ? (
          <ProfileScreen navigation={navigation} bottomInset={bottomInset} />
        ) : null}
      </TabScene>

      <View
        style={[
          styles.tabBar,
          {
            paddingBottom: tabBottomPadding,
          },
        ]}
      >
        {TABS.map((tab) => (
          <TabButton
            key={tab.key}
            active={activeTab === tab.key}
            iconName={tab.iconName}
            label={tab.label}
            onPress={() => setActiveTab(tab.key)}
          />
        ))}
      </View>
    </View>
  );
}

function TabScene({
  activeTab,
  children,
}: {
  activeTab: TabKey;
  children: React.ReactNode;
}) {
  const reduceMotion = useReduceMotion();
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1);
      return;
    }

    opacity.setValue(0.82);
    Animated.timing(opacity, {
      toValue: 1,
      duration: designSystem.animation.fast,
      useNativeDriver: true,
    }).start();
  }, [activeTab, opacity, reduceMotion]);

  return <Animated.View style={[styles.scene, { opacity }]}>{children}</Animated.View>;
}

function TabButton({
  active,
  iconName,
  label,
  onPress,
}: {
  active: boolean;
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(active ? 1 : 0)).current;
  const reduceMotion = useReduceMotion();

  useEffect(() => {
    if (reduceMotion) {
      scale.setValue(active ? 1 : 0);
      return;
    }

    Animated.timing(scale, {
      toValue: active ? 1 : 0,
      duration: designSystem.animation.fast,
      useNativeDriver: true,
    }).start();
  }, [active, reduceMotion, scale]);

  const indicatorScale = scale.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tabButton,
        pressed && styles.tabButtonPressed,
      ]}
    >
      <Animated.View
        style={[
          styles.tabIconWrap,
          active && styles.tabIconWrapActive,
          { transform: [{ scale: indicatorScale }] },
        ]}
      >
        <MaterialCommunityIcons
          name={iconName}
          size={designSystem.iconSizes.sm}
          color={
            active
              ? designSystem.colors.textInverted
              : designSystem.colors.textMuted
          }
        />
      </Animated.View>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function ExploreTab({
  bottomInset,
  onOpenRestaurant,
}: {
  bottomInset: number;
  onOpenRestaurant: (restaurant: Restaurant) => void;
}) {
  const { restaurants, loading, error, reload } = useRestaurants();

  return (
    <ScreenContainer bottomInset={bottomInset} contentStyle={styles.explore}>
      <SectionHeader
        title="Explorar"
        subtitle="Todos los restaurantes activos"
      />

      <View style={styles.searchBar}>
        <MaterialCommunityIcons
          name="magnify"
          size={designSystem.iconSizes.sm}
          color={designSystem.colors.textMuted}
        />
        <Text style={styles.searchText}>Buscar restaurantes</Text>
      </View>

      <View style={styles.filterRow}>
        <FilterChip label="Todos" selected />
        <FilterChip label="Abiertos" iconName="storefront-check-outline" />
        <FilterChip label="Con menú" iconName="food-outline" />
      </View>

      {loading ? (
        <View style={styles.feedbackStack}>
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : error ? (
        <ErrorState
          title="No se pudieron cargar los restaurantes"
          message={error}
          onRetry={reload}
          style={styles.feedbackState}
        />
      ) : restaurants.length === 0 ? (
        <EmptyState
          title="Sin restaurantes activos"
          message="Actualiza para revisar si ya hay opciones disponibles."
          iconName="store-off-outline"
          actionLabel="Actualizar"
          onActionPress={reload}
          style={styles.feedbackState}
        />
      ) : (
        <FlatList
          style={styles.flexList}
          data={restaurants}
          keyExtractor={(item) => `explore-${item.id}`}
          renderItem={({ item, index }) => (
            <RestaurantCard
              restaurant={item}
              index={index}
              onPress={onOpenRestaurant}
            />
          )}
          contentContainerStyle={[
            styles.exploreList,
            { paddingBottom: bottomInset + spacing.xxl },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenContainer>
  );
}

function FavoritesTab({
  bottomInset,
  onExplore,
}: {
  bottomInset: number;
  onExplore: () => void;
}) {
  const reduceMotion = useReduceMotion();
  const opacity = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const scale = useRef(new Animated.Value(reduceMotion ? 1 : 0.96)).current;

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1);
      scale.setValue(1);
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: designSystem.animation.normal,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: designSystem.animation.normal,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, reduceMotion, scale]);

  return (
    <ScreenContainer bottomInset={bottomInset} contentStyle={styles.favorites}>
      <SectionHeader
        title="Favoritos"
        subtitle="Tus restaurantes guardados"
      />

      <View style={styles.emptyCenter}>
        <Animated.View
          style={[
            styles.emptyState,
            {
              opacity,
              transform: [{ scale }],
            },
          ]}
        >
          <View style={styles.favoriteIllustration}>
            <View style={styles.favoriteIconMain}>
              <MaterialCommunityIcons
                name="heart-outline"
                size={designSystem.iconSizes.lg}
                color={designSystem.colors.primary}
              />
            </View>
            <View style={styles.favoriteIconSmall}>
              <MaterialCommunityIcons
                name="storefront-outline"
                size={designSystem.iconSizes.sm}
                color={designSystem.colors.secondary}
              />
            </View>
          </View>
          <EmptyState
            title="Sin favoritos todavía"
            message="Cuando guardes restaurantes aparecerán aquí."
            actionLabel="Explorar restaurantes"
            onActionPress={onExplore}
          />
        </Animated.View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designSystem.colors.background,
  },
  scene: {
    flex: 1,
  },
  tabBar: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.xs,
    minHeight: TAB_BAR_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.xs,
    borderRadius: designSystem.radii.lg,
    backgroundColor: designSystem.colors.surface,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
    ...designSystem.shadows.sm,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    minWidth: 0,
  },
  tabButtonPressed: {
    opacity: 0.78,
  },
  tabIconWrap: {
    width: 28,
    height: 28,
    borderRadius: designSystem.radii.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  tabIconWrapActive: {
    backgroundColor: designSystem.colors.primary,
  },
  tabLabel: {
    color: designSystem.colors.textMuted,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: typography.weights.semiBold,
  },
  tabLabelActive: {
    color: designSystem.colors.primary,
  },
  explore: {
    gap: spacing.sm,
  },
  searchBar: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: designSystem.radii.md,
    backgroundColor: designSystem.colors.surface,
    borderWidth: 1,
    borderColor: "rgba(240, 223, 201, 0.72)",
    ...designSystem.shadows.sm,
  },
  searchText: {
    flex: 1,
    color: designSystem.colors.textMuted,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
  },
  filterRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  exploreList: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  flexList: {
    flex: 1,
    backgroundColor: "transparent",
  },
  feedbackStack: {
    gap: spacing.md,
  },
  feedbackState: {
    marginTop: spacing.md,
  },
  favorites: {
    gap: spacing.sm,
  },
  emptyCenter: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: TAB_BAR_HEIGHT + spacing.xl,
  },
  emptyState: {
    width: "100%",
    maxWidth: 360,
    alignSelf: "center",
  },
  favoriteIllustration: {
    alignSelf: "center",
    width: 78,
    height: 62,
    marginBottom: spacing.sm,
  },
  favoriteIconMain: {
    position: "absolute",
    left: 4,
    bottom: 0,
    width: 58,
    height: 58,
    borderRadius: designSystem.radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: designSystem.colors.primaryFaint,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
  },
  favoriteIconSmall: {
    position: "absolute",
    right: 0,
    top: 4,
    width: 34,
    height: 34,
    borderRadius: designSystem.radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: designSystem.colors.secondarySoft,
    borderWidth: 1,
    borderColor: "rgba(36, 107, 97, 0.14)",
  },
});
