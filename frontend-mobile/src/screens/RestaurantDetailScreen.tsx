import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { ROUTES } from "../navigation/routes";
import { Screen } from "../components/Screen";
import { AppButton } from "../components/AppButton";
import { StatusBadge } from "../components/StatusBadge";
import { colors, typography } from "../theme";
import { spacing } from "../constants/spacing";

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.RestaurantDetail
>;

export function RestaurantDetailScreen({ navigation, route }: Props) {
  const { restaurant } = route.params;
  const initial = restaurant.name?.trim()?.charAt(0)?.toUpperCase() ?? "R";

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
            <Text style={styles.location} numberOfLines={1}>
              {restaurant.location}
            </Text>
          </View>

          <StatusBadge
            label={restaurant.isActive ? "Abierto" : "Cerrado"}
            tone={restaurant.isActive ? "success" : "danger"}
          />
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Horario</Text>
            <Text style={styles.metaValue}>
              {restaurant.openingTime} - {restaurant.closingTime}
            </Text>
          </View>
        </View>
      </View>

      {restaurant.description ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Descripción</Text>
          <Text style={styles.cardText}>{restaurant.description}</Text>
        </View>
      ) : null}

      <View style={styles.footer}>
        <AppButton
          label="Ver menú del día"
          onPress={() =>
            navigation.navigate(ROUTES.Menu, {
              restaurantId: restaurant.id,
              restaurantName: restaurant.name,
            })
          }
        />
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
  footer: {
    marginTop: "auto",
  },
});
