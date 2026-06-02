import React from "react";
import { Animated, StyleSheet } from "react-native";
import { colors } from "../../theme";
import { WelcomeOptionCard } from "./WelcomeOptionCard";
import { WelcomeLayoutMetrics } from "./welcomeTheme";
import { useWelcomeEntranceAnimation } from "./useWelcomeEntranceAnimation";

type WelcomeOptionsProps = {
  metrics: WelcomeLayoutMetrics;
  isCompact: boolean;
  onStudentPress: () => void;
  onCommunityPress: () => void;
};

export function WelcomeOptions({
  metrics,
  isCompact,
  onStudentPress,
  onCommunityPress,
}: WelcomeOptionsProps) {
  const cardsEntrance = useWelcomeEntranceAnimation(220);

  return (
    <Animated.View
      style={[
        styles.optionsRow,
        {
          marginTop: metrics.cardsTopMargin,
          gap: metrics.cardsGap,
        },
        cardsEntrance,
      ]}
    >
      <WelcomeOptionCard
        title="Estudiante"
        subtitle="Cuenta institucional"
        icon="school-outline"
        iconColor={colors.success}
        onPress={onStudentPress}
        variant="student"
        metrics={metrics}
        isCompact={isCompact}
        accessibilityLabel="Continuar como estudiante"
      />

      <WelcomeOptionCard
        title="Comunidad"
        subtitle="Personal y usuarios"
        icon="account-group-outline"
        iconColor={colors.error}
        onPress={onCommunityPress}
        variant="community"
        metrics={metrics}
        isCompact={isCompact}
        accessibilityLabel="Continuar como comunidad"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  optionsRow: {
    width: "100%",
    maxWidth: 336,
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
