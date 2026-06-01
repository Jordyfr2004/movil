import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import {
  DECOR_ORANGE,
  DECOR_ORANGE_SOFT,
  LoginLayoutMetrics,
  clamp,
} from "./loginTheme";
import { DecorBowlIcon, DecorCupIcon, DecorLeafIcon } from "./LoginDecorIcons";

type LoginFooterArtworkProps = {
  metrics: LoginLayoutMetrics;
  screenWidth: number;
};

export function LoginFooterArtwork({
  metrics,
  screenWidth,
}: LoginFooterArtworkProps) {
  const footerArtWidth = Math.min(
    screenWidth - metrics.horizontalPadding * 2,
    320
  );
  const bowlSize = metrics.footerIconSize;
  const glassSize = metrics.footerIconSize - 2;
  const leafSize = metrics.footerIconSize - 4;

  const footerAccentIcons = [
    {
      name: "circle-medium" as const,
      size: clamp(Math.round(metrics.footerIconSize * 0.24), 12, 16),
      style: {
        top: Math.round(metrics.footerArtHeight * 0.28),
        left: Math.round(footerArtWidth * 0.02),
      },
    },
    {
      name: "circle-medium" as const,
      size: clamp(Math.round(metrics.footerIconSize * 0.24), 12, 16),
      style: {
        top: Math.round(metrics.footerArtHeight * 0.58),
        left: Math.round(footerArtWidth * 0.67),
      },
    },
    {
      name: "star-four-points-outline" as const,
      size: clamp(Math.round(metrics.footerIconSize * 0.28), 16, 18),
      style: {
        top: Math.round(metrics.footerArtHeight * 0.74),
        left: Math.round(footerArtWidth * 0.1),
      },
    },
    {
      name: "star-four-points-outline" as const,
      size: clamp(Math.round(metrics.footerIconSize * 0.28), 16, 18),
      style: {
        top: Math.round(metrics.footerArtHeight * 0.12),
        right: Math.round(footerArtWidth * 0.02),
      },
    },
  ];

  return (
    <View
      style={[
        styles.footerArt,
        {
          height: metrics.footerArtHeight,
          maxWidth: footerArtWidth,
          marginTop: -metrics.footerArtLift,
        },
      ]}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {footerAccentIcons.map((icon, index) => (
        <MaterialCommunityIcons
          key={`${icon.name}-${index}`}
          name={icon.name}
          size={icon.size}
          color={DECOR_ORANGE_SOFT}
          style={[styles.footerAccentIcon, icon.style]}
          accessible={false}
        />
      ))}

      <View
        style={[
          styles.footerFoodIcon,
          {
            top: Math.round(metrics.footerArtHeight * 0.14),
            left: Math.round(footerArtWidth * 0.08),
          },
        ]}
      >
        <DecorBowlIcon color={DECOR_ORANGE} size={bowlSize} />
      </View>

      <View
        style={[
          styles.footerFoodIcon,
          {
            top: Math.round(metrics.footerArtHeight * 0.24),
            left: Math.round((footerArtWidth - glassSize) / 2),
          },
        ]}
      >
        <DecorCupIcon color={DECOR_ORANGE} size={glassSize} />
      </View>

      <View
        style={[
          styles.footerFoodIcon,
          {
            top: Math.round(metrics.footerArtHeight * 0.17),
            left: Math.round(footerArtWidth * 0.73),
          },
        ]}
      >
        <DecorLeafIcon color={DECOR_ORANGE} size={leafSize} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footerArt: {
    position: "relative",
    width: "100%",
    alignSelf: "center",
  },
  footerAccentIcon: {
    position: "absolute",
  },
  footerFoodIcon: {
    position: "absolute",
  },
});
