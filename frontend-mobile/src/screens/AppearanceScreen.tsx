import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { Screen } from "../components";
import { spacing } from "../constants/spacing";
import {
  AppearanceMode,
  useAppPreferences,
} from "../context/AppPreferencesContext";
import { ROUTES } from "../navigation/routes";
import { StudentStackParamList } from "../navigation/types";
import { designSystem, typography } from "../theme";
import { studentPalette } from "../theme/studentPalette";

type Props = NativeStackScreenProps<
  StudentStackParamList,
  typeof ROUTES.Appearance
>;

const OPTIONS: Array<{
  value: AppearanceMode;
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
}> = [
  { value: "light", label: "Claro", icon: "white-balance-sunny" },
  { value: "dark", label: "Oscuro", icon: "weather-night" },
  { value: "system", label: "Según sistema", icon: "cellphone-cog" },
];

export function AppearanceScreen({}: Props) {
  const { appearanceMode, resolvedScheme, setAppearanceMode } =
    useAppPreferences();

  return (
    <Screen style={styles.container}>
      <Text style={styles.title}>Apariencia</Text>
      <Text style={styles.subtitle}>
        Modo actual: {resolvedScheme === "dark" ? "oscuro" : "claro"}
      </Text>

      <View style={styles.options}>
        {OPTIONS.map((option) => {
          const selected = option.value === appearanceMode;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setAppearanceMode(option.value)}
              style={({ pressed }) => [
                styles.option,
                selected && styles.optionSelected,
                pressed && styles.optionPressed,
              ]}
            >
              <MaterialCommunityIcons
                name={option.icon}
                size={designSystem.iconSizes.md}
                color={
                  selected
                    ? designSystem.colors.primary
                    : designSystem.colors.textMuted
                }
              />
              <Text style={styles.optionText}>{option.label}</Text>
              {selected ? (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={designSystem.iconSizes.md}
                  color={designSystem.colors.primary}
                />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: studentPalette.background },
  title: {
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    marginTop: spacing.xs,
    color: designSystem.colors.textSecondary,
    fontSize: typography.sizes.sm,
  },
  options: { gap: spacing.sm, marginTop: spacing.lg },
  option: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 18,
    backgroundColor: designSystem.colors.surface,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
  },
  optionSelected: { borderColor: designSystem.colors.primarySoft },
  optionPressed: { backgroundColor: designSystem.colors.surfacePressed },
  optionText: {
    flex: 1,
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
});
