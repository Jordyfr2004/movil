import React, { useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "../components/Screen";
import { RestaurantCard } from "../components/RestaurantCard";
import { useRestaurants } from "../hooks/useRestaurants";
import { RootStackParamList } from "../navigation/types";
import { ROUTES } from "../navigation/routes";
import { colors, typography } from "../theme";
import { spacing } from "../constants/spacing";
import { useAuth } from "../context/AuthContex";

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.Home>;

export function HomeScreen({ navigation }: Props) {
  const { restaurants, loading } = useRestaurants();
  const { user } = useAuth();

  const displayName = useMemo(() => {
    const email = user?.email?.trim();
    if (!email) return "";
    return email.split("@")[0] ?? "";
  }, [user?.email]);

  return (
    <Screen style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.heroBg} pointerEvents="none">
          <View style={styles.heroBlob} />
        </View>

        <Text style={styles.greeting}>
          Hola{displayName ? `, ${displayName}` : ""}
        </Text>
        <Text style={styles.heroTitle}>Elige un restaurante y reserva tu menú.</Text>
        <Text style={styles.heroSubtitle}>
          Revisa horarios, disponibilidad y confirma tu cupo.
        </Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Restaurantes</Text>
        <Text style={styles.sectionMeta}>
          {loading ? "Cargando…" : `${restaurants.length} disponibles`}
        </Text>
      </View>

      <FlatList
        data={restaurants}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <RestaurantCard
            restaurant={item}
            onPress={(restaurant) =>
              navigation.navigate(ROUTES.RestaurantDetail, { restaurant })
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>
              {loading ? "Cargando restaurantes…" : "Sin restaurantes activos"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {loading
                ? "Esto puede tomar unos segundos."
                : "Vuelve más tarde para ver opciones disponibles."}
            </Text>
          </View>
        }
      />
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
    marginBottom: spacing.xl,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 1,
  },
  heroBg: {
    ...StyleSheet.absoluteFillObject,
  },
  heroBlob: {
    position: "absolute",
    top: -90,
    right: -110,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.primarySoft,
    opacity: 0.9,
  },
  greeting: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.semiBold,
    letterSpacing: 0.2,
    marginBottom: spacing.sm,
  },
  heroTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    lineHeight: typography.lineHeights.xl,
  },
  heroSubtitle: {
    marginTop: spacing.sm,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  sectionMeta: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  listContent: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  emptyCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginTop: spacing.sm,
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
