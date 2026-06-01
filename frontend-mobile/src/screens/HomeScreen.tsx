import React, { useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { ErrorMessage } from "../components/ErrorMessage";
import { LoadingState } from "../components/LoadingState";
import { RestaurantCard } from "../components/RestaurantCard";
import { Screen } from "../components/Screen";
import { spacing } from "../constants/spacing";
import { useAuth } from "../context/AuthContext";
import { useRestaurants } from "../hooks/useRestaurants";
import { ROUTES } from "../navigation/routes";
import { RootStackParamList } from "../navigation/types";
import { colors, typography } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.Home>;

export function HomeScreen({ navigation }: Props) {
  const { restaurants, loading, error, reload } = useRestaurants();
  const { user } = useAuth();

  const displayName = useMemo(() => {
    const email = user?.email?.trim();
    if (!email) return "";
    return email.split("@")[0] ?? "";
  }, [user?.email]);

  return (
    <Screen style={styles.container}>
      <Card style={styles.hero}>
        <View style={styles.heroBg} pointerEvents="none">
          <View style={styles.heroBlob} />
        </View>

        <Text style={styles.greeting}>
          Hola{displayName ? `, ${displayName}` : ""}
        </Text>
        <Text style={styles.heroTitle}>
          Elige un restaurante y reserva tu menú.
        </Text>
        <Text style={styles.heroSubtitle}>
          Revisa horarios, disponibilidad y confirma tu cupo.
        </Text>
      </Card>

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
          loading ? (
            <LoadingState
              message="Esto puede tomar unos segundos."
              style={styles.feedbackState}
            />
          ) : error ? (
            <ErrorMessage
              title="No se pudieron cargar los restaurantes"
              message={error}
              onRetry={reload}
              style={styles.feedbackState}
            />
          ) : (
            <EmptyState
              title="Sin restaurantes activos"
              message="Vuelve más tarde para ver opciones disponibles."
              iconName="silverware-fork-knife"
              style={styles.feedbackState}
            />
          )
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
    marginBottom: spacing.xl,
    overflow: "hidden",
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
  feedbackState: {
    marginTop: spacing.sm,
  },
});
