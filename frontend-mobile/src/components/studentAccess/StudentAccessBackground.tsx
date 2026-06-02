import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { decorativeBackgroundIcons } from "./studentAccessTheme";

type StudentAccessBackgroundProps = {
  backgroundScale: number;
};

export function StudentAccessBackground({
  backgroundScale,
}: StudentAccessBackgroundProps) {
  return (
    <View
      style={styles.background}
      pointerEvents="none"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {decorativeBackgroundIcons.map((icon, index) => (
        <MaterialCommunityIcons
          key={`${icon.name}-${index}`}
          name={icon.name}
          size={icon.size * backgroundScale}
          color={icon.color}
          style={[styles.backgroundIcon, icon.style]}
          accessible={false}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundIcon: {
    position: "absolute",
  },
});
