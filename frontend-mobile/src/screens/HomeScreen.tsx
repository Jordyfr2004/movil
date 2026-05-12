import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "../components/Screen";
import { RestaurantCard } from "../components/RestaurantCard";
import { AppButton } from "../components/AppButton";
import { useRestaurants } from "../hooks/useRestaurants";
import { RootStackParamList } from "../navigation/types";
import { ROUTES } from "../navigation/routes";
import { mockUser } from "../constants/mockUser";
import { colors, typography } from "../theme";
import { spacing } from "../constants/spacing";

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.Home>;

export function HomeScreen({ navigation }: Props) {
  const { restaurants, loading } = useRestaurants();
  const firstName = mockUser.fullName.split(" ")[0] || "";

  return (
    <Screen style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.heroBg} pointerEvents="none">
          <View style={styles.heroBlob} />
        </View>

        <Text style={styles.greeting}>Hola{firstName ? `, ${firstName}` : ""}</Text>
        <Text style={styles.heroTitle}>Elige un restaurante y reserva tu menú.</Text>
        <Text style={styles.heroSubtitle}>
          Revisa horarios, disponibilidad y confirma tu cupo.
        </Text>

        <View style={styles.heroActions}>
          <AppButton
            label="Mis reservas"
            variant="secondary"
            size="sm"
            onPress={() =>
              navigation.navigate(ROUTES.MyReservations, { userId: mockUser.id })
            }
          />
          <AppButton
            label="Acelerómetro"
            variant="secondary"
            size="sm"
            onPress={() => navigation.navigate(ROUTES.SensorMovimiento)}
          />
          <AppButton
            label="Evidencias"
            variant="secondary"
            size="sm"
            onPress={() => navigation.navigate(ROUTES.Evidence)}
          />
          <AppButton
            label="Perfil"
            variant="secondary"
            size="sm"
            onPress={() => navigation.navigate(ROUTES.Profile)}
          />
        </View>
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
    width: 240,
    height: 240,
    borderRadius: 240,
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
  heroActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.lg,
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
