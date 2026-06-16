import React, { useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";

import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { ErrorMessage } from "../components/ErrorMessage";
import { LoadingState } from "../components/LoadingState";
import { RestaurantCard } from "../components/RestaurantCard";
import { Screen } from "../components/Screen";
import { StudentSectionHeader } from "../components/StudentSectionHeader";
import { StudentVisualPlaceholder } from "../components/StudentVisualPlaceholder";
import { spacing } from "../constants/spacing";
import { useAuth } from "../context/AuthContext";
import { useRestaurants } from "../hooks/useRestaurants";
import { ROUTES } from "../navigation/routes";
import { RootStackParamList } from "../navigation/types";
import { typography } from "../theme";
import { studentPalette } from "../theme/studentPalette";

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
      <View
        style={styles.backgroundDecor}
        pointerEvents="none"
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Svg
          width="100%"
          height={130}
          viewBox="0 0 360 130"
          preserveAspectRatio="none"
          style={styles.backgroundWave}
        >
          <Path
            d="M0 0 H360 V68 C292 96 224 42 145 66 C83 88 38 86 0 66 Z"
            fill={studentPalette.backgroundStrong}
          />
        </Svg>
      </View>

      <Card style={styles.hero}>
        <View
          style={styles.heroArt}
          pointerEvents="none"
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Svg
            width="100%"
            height={62}
            viewBox="0 0 360 62"
            preserveAspectRatio="none"
            style={styles.heroWave}
          >
            <Path
              d="M0 38 C70 18 140 54 215 38 C282 24 322 18 360 28 V62 H0 Z"
              fill={studentPalette.primaryPale}
            />
          </Svg>
          <View style={styles.heroGlow} />
        </View>

        <View style={styles.heroContent}>
          <View style={styles.heroCopy}>
            <View style={styles.heroEyebrow}>
              <View style={styles.heroIcon}>
                <MaterialCommunityIcons
                  name="silverware-fork-knife"
                  size={17}
                  color={studentPalette.primary}
                />
              </View>
              <Text style={styles.heroEyebrowText}>Reserva estudiantil</Text>
            </View>

            <Text style={styles.greeting}>
              Hola{displayName ? `, ${displayName}` : ""}
            </Text>
            <Text style={styles.heroTitle}>
              Elige un restaurante y reserva tu menú
            </Text>
            <Text style={styles.heroSubtitle}>
              Revisa horarios, disponibilidad y confirma tu cupo.
            </Text>
          </View>

          <StudentVisualPlaceholder
            iconName="food"
            label="Reserva de comida"
            size="md"
            style={styles.heroVisual}
            variant="dish"
          />
        </View>
      </Card>

      <StudentSectionHeader
        count={loading ? "..." : restaurants.length}
        iconName="silverware-fork-knife"
        style={styles.sectionHeader}
        subtitle="Opciones disponibles cerca de ti"
        title="Restaurantes"
      />

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
        ListFooterComponent={
          !loading && !error && restaurants.length <= 1 ? (
            <ReservationStepsCard />
          ) : null
        }
      />
    </Screen>
  );
}

function ReservationStepsCard() {
  const steps = [
    { iconName: "storefront-outline" as const, label: "Elige restaurante" },
    { iconName: "food-outline" as const, label: "Selecciona plato" },
    { iconName: "check-circle-outline" as const, label: "Confirma cupo" },
  ];

  return (
    <Card style={styles.stepsCard}>
      <Text style={styles.stepsTitle}>Reserva en 3 pasos</Text>
      <View style={styles.stepsRow}>
        {steps.map((step) => (
          <View key={step.label} style={styles.stepItem}>
            <View style={styles.stepIcon}>
              <MaterialCommunityIcons
                name={step.iconName}
                size={17}
                color={studentPalette.primary}
              />
            </View>
            <Text style={styles.stepLabel} numberOfLines={2}>
              {step.label}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: studentPalette.background,
  },
  backgroundDecor: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  backgroundWave: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
  },
  hero: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: 22,
    borderColor: studentPalette.border,
    backgroundColor: studentPalette.cardMuted,
    shadowColor: studentPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
    overflow: "hidden",
  },
  heroArt: {
    ...StyleSheet.absoluteFillObject,
  },
  heroWave: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
  },
  heroGlow: {
    position: "absolute",
    width: 104,
    height: 104,
    borderRadius: 999,
    right: -38,
    top: -30,
    backgroundColor: "rgba(247, 101, 2, 0.07)",
  },
  heroContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
  },
  heroEyebrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  heroIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: studentPalette.primaryPale,
    borderWidth: 1,
    borderColor: studentPalette.border,
  },
  heroEyebrowText: {
    fontSize: typography.sizes.xs,
    color: studentPalette.primary,
    fontWeight: typography.weights.bold,
    letterSpacing: 0,
  },
  greeting: {
    fontSize: typography.sizes.sm,
    color: studentPalette.primary,
    fontWeight: typography.weights.semiBold,
    marginBottom: spacing.xs,
  },
  heroTitle: {
    maxWidth: 232,
    fontSize: 24,
    fontWeight: typography.weights.bold,
    color: studentPalette.textPrimary,
    lineHeight: 30,
  },
  heroSubtitle: {
    maxWidth: 230,
    marginTop: spacing.xs,
    fontSize: typography.sizes.sm,
    color: studentPalette.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
  heroVisual: {
    width: 72,
    height: 88,
    minHeight: 88,
    borderRadius: 20,
  },
  sectionHeader: {
    marginBottom: spacing.md,
  },
  listContent: {
    gap: spacing.sm,
    paddingBottom: spacing.xxl,
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
  stepsCard: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: 20,
    borderColor: studentPalette.border,
    backgroundColor: studentPalette.card,
    shadowColor: studentPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 1,
  },
  stepsTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: studentPalette.textPrimary,
    lineHeight: typography.lineHeights.md,
    marginBottom: spacing.sm,
  },
  stepsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  stepItem: {
    flex: 1,
    gap: spacing.xs,
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: studentPalette.primaryPale,
    borderWidth: 1,
    borderColor: studentPalette.border,
  },
  stepLabel: {
    fontSize: typography.sizes.xs,
    color: studentPalette.textSecondary,
    lineHeight: typography.lineHeights.xs,
    fontWeight: typography.weights.semiBold,
  },
});
