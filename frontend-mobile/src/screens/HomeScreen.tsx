import React, { useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";

import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { ErrorMessage } from "../components/ErrorMessage";
import { LoadingState } from "../components/LoadingState";
import {
  DecorCupIcon,
  DecorLeafIcon,
} from "../components/login/LoginDecorIcons";
import { RestaurantCard } from "../components/RestaurantCard";
import { Screen } from "../components/Screen";
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
          height={150}
          viewBox="0 0 360 150"
          preserveAspectRatio="none"
          style={styles.backgroundWave}
        >
          <Path
            d="M0 0 H360 V70 C285 112 218 30 138 67 C82 93 39 94 0 72 Z"
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
            height={92}
            viewBox="0 0 360 92"
            preserveAspectRatio="none"
            style={styles.heroWave}
          >
            <Path
              d="M0 55 C70 25 140 82 215 58 C282 37 322 25 360 42 V92 H0 Z"
              fill={studentPalette.primaryPale}
            />
          </Svg>
          <View style={styles.heroCup}>
            <DecorCupIcon color={studentPalette.decorOrange} size={42} />
          </View>
          <View style={styles.heroLeaf}>
            <DecorLeafIcon color={studentPalette.decorOrangeSoft} size={46} />
          </View>
        </View>

        <View style={styles.heroEyebrow}>
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons
              name="silverware-fork-knife"
              size={18}
              color={studentPalette.primary}
            />
          </View>
          <Text style={styles.heroEyebrowText}>DESCUBRE Y RESERVA</Text>
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
        <View style={styles.sectionTitleGroup}>
          <Text style={styles.sectionTitle}>Restaurantes</Text>
          <Text style={styles.sectionSubtitle}>
            Opciones disponibles cerca de ti
          </Text>
        </View>

        <View style={styles.sectionMetaBadge}>
          <Text style={styles.sectionMeta}>
            {loading ? "..." : restaurants.length}
          </Text>
        </View>
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
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: 22,
    borderColor: studentPalette.border,
    backgroundColor: studentPalette.card,
    shadowColor: studentPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
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
  heroCup: {
    position: "absolute",
    top: 8,
    right: 14,
    transform: [{ rotate: "7deg" }],
  },
  heroLeaf: {
    position: "absolute",
    right: 54,
    bottom: 2,
    transform: [{ rotate: "-9deg" }],
  },
  heroEyebrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  heroIcon: {
    width: 32,
    height: 32,
    borderRadius: 11,
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
    letterSpacing: 1.1,
  },
  greeting: {
    fontSize: typography.sizes.sm,
    color: studentPalette.textSecondary,
    fontWeight: typography.weights.semiBold,
    marginBottom: spacing.xs,
  },
  heroTitle: {
    maxWidth: "92%",
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: studentPalette.textPrimary,
    lineHeight: typography.lineHeights.xl,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    maxWidth: "90%",
    marginTop: spacing.sm,
    fontSize: typography.sizes.sm,
    color: studentPalette.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitleGroup: {
    flex: 1,
    gap: 2,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: studentPalette.textPrimary,
    lineHeight: typography.lineHeights.lg,
  },
  sectionSubtitle: {
    fontSize: typography.sizes.sm,
    color: studentPalette.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
  sectionMetaBadge: {
    minWidth: 36,
    height: 36,
    paddingHorizontal: spacing.sm,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: studentPalette.card,
    borderWidth: 1,
    borderColor: studentPalette.border,
    shadowColor: studentPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  sectionMeta: {
    fontSize: typography.sizes.sm,
    color: studentPalette.primary,
    fontWeight: typography.weights.bold,
  },
  listContent: {
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  feedbackState: {
    marginTop: spacing.sm,
    borderRadius: 22,
    borderColor: studentPalette.border,
    backgroundColor: studentPalette.card,
    shadowColor: studentPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
});
