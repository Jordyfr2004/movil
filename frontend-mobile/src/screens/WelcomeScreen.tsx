import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { ROUTES } from "../navigation/routes";
import { Screen } from "../components/Screen";
import { AppButton } from "../components/AppButton";
import { colors, typography } from "../theme";
import { spacing } from "../constants/spacing";

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.Welcome>;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ULEAM Restaurantes</Text>
        <Text style={styles.subtitle}>
          Reserva tu menu en minutos y revisa cupos disponibles.
        </Text>
      </View>
      <AppButton
        label="Comenzar"
        onPress={() => navigation.navigate(ROUTES.Login)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
  },
  header: {
    gap: spacing.md,
    paddingTop: spacing.xxl,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
