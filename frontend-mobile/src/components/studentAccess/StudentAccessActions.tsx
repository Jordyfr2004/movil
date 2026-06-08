import React from "react";
import { Animated, StyleSheet, View } from "react-native";
import { StudentAccessAuthButton } from "./StudentAccessAuthButton";
import { StudentAccessLayoutMetrics } from "./studentAccessTheme";
import { useStudentAccessEntranceAnimation } from "./useStudentAccessEntranceAnimation";

type StudentAccessActionsProps = {
  metrics: StudentAccessLayoutMetrics;
  onMicrosoftPress: () => void;
};

export function StudentAccessActions({
  metrics,
  onMicrosoftPress,
}: StudentAccessActionsProps) {
  const actionsEntrance = useStudentAccessEntranceAnimation(220);

  return (
    <Animated.View
      style={[
        styles.actions,
        {
          maxWidth: metrics.actionsMaxWidth,
          gap: metrics.actionsGap,
          marginTop: metrics.actionsTopMargin,
        },
        actionsEntrance,
      ]}
    >
      <StudentAccessAuthButton
        label="Ingresar con cuenta institucional"
        accessibilityLabel="Ingresar con cuenta institucional"
        leftIcon={<StudentAccessMicrosoftIcon />}
        metrics={metrics}
        onPress={onMicrosoftPress}
      />
    </Animated.View>
  );
}

function StudentAccessMicrosoftIcon() {
  return (
    <View style={styles.microsoftGrid} accessible={false}>
      <View style={[styles.microsoftSquare, styles.microsoftSquareRed]} />
      <View style={[styles.microsoftSquare, styles.microsoftSquareGreen]} />
      <View style={[styles.microsoftSquare, styles.microsoftSquareBlue]} />
      <View style={[styles.microsoftSquare, styles.microsoftSquareYellow]} />
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    width: "100%",
  },
  microsoftGrid: {
    width: 18,
    height: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
  },
  microsoftSquare: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  microsoftSquareRed: {
    backgroundColor: "#F25022",
  },
  microsoftSquareGreen: {
    backgroundColor: "#7FBA00",
  },
  microsoftSquareBlue: {
    backgroundColor: "#2563EB",
  },
  microsoftSquareYellow: {
    backgroundColor: "#FFB900",
  },
});
