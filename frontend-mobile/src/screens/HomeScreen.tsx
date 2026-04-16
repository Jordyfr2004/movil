import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "../components/Screen";
import { RestaurantCard } from "../components/RestaurantCard";
import { useRestaurants } from "../hooks/useRestaurants";
import { RootStackParamList } from "../navigation/types";
import { ROUTES } from "../navigation/routes";
import { mockUser } from "../constants/mockUser";
import { colors, typography } from "../theme";
import { spacing } from "../constants/spacing";

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.Home>;

export function HomeScreen({ navigation }: Props) {
  const { restaurants, loading } = useRestaurants();

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Restaurantes disponibles</Text>
        <Text style={styles.subtitle}>
          Revisa horarios y cupos antes de reservar.
        </Text>
        <View style={styles.actions}>
          <Pressable
            onPress={() =>
              navigation.navigate(ROUTES.MyReservations, { userId: mockUser.id })
            }
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
            ]}
          >
            <Text style={styles.actionText}>Mis reservas</Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate(ROUTES.Profile)}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
            ]}
          >
            <Text style={styles.actionText}>Perfil</Text>
          </Pressable>
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
            <Text style={styles.emptyText}>Cargando restaurantes...</Text>
          ) : (
            <Text style={styles.emptyText}>No hay restaurantes activos.</Text>
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.lg,
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButtonPressed: {
    opacity: 0.8,
  },
  actionText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.semiBold,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  listContent: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  emptyText: {
    textAlign: "center",
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
});
