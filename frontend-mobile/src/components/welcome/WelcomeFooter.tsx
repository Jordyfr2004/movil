import React from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import {
  SURFACE,
  TEXT_MUTED,
  WelcomeLayoutMetrics,
} from "./welcomeTheme";
import { WelcomeFooterArtwork } from "./WelcomeFooterArtwork";
import { WelcomeFooterWave } from "./WelcomeFooterWave";
import { useWelcomeEntranceAnimation } from "./useWelcomeEntranceAnimation";

type WelcomeFooterProps = {
  metrics: WelcomeLayoutMetrics;
  screenWidth: number;
};

export function WelcomeFooter({
  metrics,
  screenWidth,
}: WelcomeFooterProps) {
  const footerEntrance = useWelcomeEntranceAnimation(300);

  return (
    <Animated.View
      style={[
        styles.footerSection,
        { marginTop: metrics.footerTopMargin },
        footerEntrance,
      ]}
    >
      <WelcomeFooterWave metrics={metrics} screenWidth={screenWidth} />

      <View
        style={[
          styles.footerPanel,
          {
            paddingTop: metrics.footerPanelTopPadding,
            paddingBottom: metrics.footerPanelBottomPadding,
            paddingHorizontal: metrics.horizontalPadding,
          },
        ]}
      >
        <WelcomeFooterArtwork metrics={metrics} screenWidth={screenWidth} />

        <Text
          style={[
            styles.footerNote,
            {
              marginTop: metrics.footerTextTopGap,
              fontSize: metrics.footerFontSize,
              lineHeight: metrics.footerLineHeight,
            },
          ]}
        >
          {"Dirección de Bienestar Universitario • ULEAM"}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  footerSection: {
    width: "100%",
  },
  footerPanel: {
    backgroundColor: SURFACE,
    marginTop: -1,
  },
  footerNote: {
    width: "100%",
    maxWidth: 312,
    alignSelf: "center",
    color: TEXT_MUTED,
    textAlign: "center",
    opacity: 0.9,
  },
});
