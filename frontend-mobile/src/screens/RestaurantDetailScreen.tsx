import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { ROUTES } from "../navigation/routes";
import { Screen } from "../components/Screen";
import { StatusBadge } from "../components/StatusBadge";
import { colors, typography } from "../theme";
import { spacing } from "../constants/spacing";
import { useDishesByRestaurant } from "../hooks/useDishesByRestaurant";

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.RestaurantDetail
>;

export function RestaurantDetailScreen({ navigation, route }: Props) {
  const { restaurant } = route.params;
  const initial = restaurant.name?.trim()?.charAt(0)?.toUpperCase() ?? "R";
  const restaurantId = String(restaurant.id);
  const { dishes, loading } = useDishesByRestaurant(restaurantId);

  return (
    <Screen style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.heroHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>

          <View style={styles.heroText}>
            <Text style={styles.name} numberOfLines={2}>
              {restaurant.name}
            </Text>
            {restaurant.location ? (
              <Text style={styles.location} numberOfLines={1}>
                {restaurant.location}
              </Text>
            ) : null}
          </View>

          <StatusBadge
            label={restaurant.isActive ? "Abierto" : "Cerrado"}
            tone={restaurant.isActive ? "success" : "danger"}
          />
        </View>

        {restaurant.openingTime && restaurant.closingTime ? (
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Horario</Text>
              <Text style={styles.metaValue}>
                {restaurant.openingTime} - {restaurant.closingTime}
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      {restaurant.description ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Descripción</Text>
          <Text style={styles.cardText}>{restaurant.description}</Text>
        </View>
      ) : null}

      <View style={styles.menuCard}>
        <Text style={styles.menuTitle}>Menú del día</Text>
        <Text style={styles.menuSubtitle}>
          Platos disponibles para reservar.
        </Text>

        {loading ? (
          <View style={styles.menuLoading}>
            <View style={styles.skeletonLineLg} />
            <View style={styles.skeletonLineSm} />
            <View style={styles.skeletonLineLg} />
          </View>
        ) : dishes.length > 0 ? (
          <View style={styles.menuList}>
            {dishes.map((dish) => (
              <View key={dish.id} style={styles.dishRow}>
                <View style={styles.dishText}>
                  <Text style={styles.dishName} numberOfLines={1}>
                    {dish.name}
                  </Text>
                  <Text style={styles.dishMeta} numberOfLines={1}>
                    Disponible hoy
                  </Text>
                </View>
                <Text style={styles.dishPrice} numberOfLines={1}>
                  ${dish.price}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No hay platos disponibles</Text>
            <Text style={styles.emptySubtitle}>
              Vuelve más tarde para ver el menú.
            </Text>
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 1,
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  heroText: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeights.xl,
  },
  location: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
  metaRow: {
    marginTop: spacing.lg,
  },
  metaItem: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  metaLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  metaValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  cardTitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.semiBold,
    marginBottom: spacing.sm,
  },
  cardText: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    lineHeight: typography.lineHeights.md,
  },
  menuCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  menuTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  menuSubtitle: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
  menuLoading: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  skeletonLineLg: {
    height: 14,
    borderRadius: 10,
    backgroundColor: colors.surfaceMuted,
    width: "70%",
  },
  skeletonLineSm: {
    height: 12,
    borderRadius: 10,
    backgroundColor: colors.surfaceMuted,
    width: "45%",
  },
  menuList: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  dishRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dishText: {
    flex: 1,
    gap: 2,
  },
  dishName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semiBold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeights.md,
  },
  dishMeta: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    lineHeight: typography.lineHeights.sm,
  },
  dishPrice: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  emptyCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
});
