import React, { useMemo } from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

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
import { typography } from "../theme";
import { studentPalette } from "../theme/studentPalette";

const CAMPUS_BUILDING_IMAGE = require("../assets/images/edificio_uleam_transparente_beige.png");

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
      <FlatList
        data={restaurants}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <HomeHeader
            displayName={displayName}
            count={loading ? "..." : restaurants.length}
          />
        }
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

function HomeHeader({
  displayName,
  count,
}: {
  displayName: string;
  count: string | number;
}) {
  return (
    <View style={styles.headerWrapper}>
      <View style={styles.hero}>
        <View
          pointerEvents="none"
          style={styles.campusDecor}
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Image
            source={CAMPUS_BUILDING_IMAGE}
            resizeMode="contain"
            style={styles.campusImage}
          />
        </View>

        {displayName ? (
          <Text style={styles.greeting}>Hola, {displayName}</Text>
        ) : (
          <Text style={styles.greeting}>Descubre y disfruta</Text>
        )}

        <Text style={styles.heroTitle}>
          El mejor lugar{"\n"}para cada antojo
        </Text>

        <Text style={styles.heroSubtitle}>
          Explora nuestros restaurantes en el campus y elige tu próximo
          favorito.
        </Text>
      </View>

      <View style={styles.sectionTitleRow}>
        <View>
          <Text style={styles.sectionEyebrow}>Restaurantes disponibles</Text>
          <Text style={styles.sectionTitle}>Explora opciones cerca de ti</Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>{count}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: studentPalette.background,
  },
  listContent: {
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  headerWrapper: {
    marginBottom: spacing.xs,
  },
  hero: {
    minHeight: 230,
    justifyContent: "center",
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    overflow: "hidden",
  },
  campusDecor: {
    position: "absolute",
    right: -48,
    top: 22,
    width: 270,
    height: 190,
    opacity: 0.32,
  },
  campusImage: {
    width: "100%",
    height: "100%",
  },
  greeting: {
    color: studentPalette.primary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
  },
  heroTitle: {
    maxWidth: 270,
    color: studentPalette.textPrimary,
    fontSize: 33,
    lineHeight: 39,
    fontWeight: typography.weights.bold,
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    maxWidth: 300,
    marginTop: spacing.md,
    color: studentPalette.textSecondary,
    fontSize: typography.sizes.md,
    lineHeight: 23,
  },
  sectionTitleRow: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionEyebrow: {
    color: studentPalette.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    color: studentPalette.textPrimary,
    fontSize: typography.sizes.lg,
    lineHeight: typography.lineHeights.lg,
    fontWeight: typography.weights.bold,
  },
  countBadge: {
    minWidth: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: studentPalette.primaryPale,
    borderWidth: 1,
    borderColor: studentPalette.border,
  },
  countText: {
    color: studentPalette.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  feedbackState: {
    marginTop: spacing.sm,
    borderRadius: 22,
    borderColor: studentPalette.border,
    backgroundColor: studentPalette.card,
    shadowColor: studentPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
});