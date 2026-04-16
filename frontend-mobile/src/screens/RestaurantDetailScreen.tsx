import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { ROUTES } from "../navigation/routes";
import { Screen } from "../components/Screen";
import { AppButton } from "../components/AppButton";
import { colors, typography } from "../theme";
import { spacing } from "../constants/spacing";

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.RestaurantDetail
>;

export function RestaurantDetailScreen({ navigation, route }: Props) {
  const { restaurant } = route.params;

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.name}>{restaurant.name}</Text>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: restaurant.isActive
                  ? colors.success
                  : colors.error,
              },
            ]}
          />
          <Text style={styles.statusText}>
            {restaurant.isActive ? "Abierto" : "Cerrado"}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ubicacion</Text>
        <Text style={styles.sectionText}>{restaurant.location}</Text>
      </View>

      {restaurant.description ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripcion</Text>
          <Text style={styles.sectionText}>{restaurant.description}</Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Horario</Text>
        <Text style={styles.sectionText}>
          {restaurant.openingTime} - {restaurant.closingTime}
        </Text>
      </View>

      <View style={styles.footer}>
        <AppButton
          label="Ver menu del dia"
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
  header: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  name: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  sectionText: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
  },
  footer: {
    marginTop: "auto",
  },
}
);
