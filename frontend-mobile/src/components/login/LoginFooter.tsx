import React from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { typography } from "../../theme";
import {
  ACCENT_ORANGE,
  LoginLayoutMetrics,
  SURFACE,
  TEXT_MUTED,
} from "./loginTheme";
import { LoginFooterArtwork } from "./LoginFooterArtwork";
import { LoginFooterWave } from "./LoginFooterWave";
import { useEntranceAnimation } from "./useEntranceAnimation";

type LoginFooterProps = {
  metrics: LoginLayoutMetrics;
  screenWidth: number;
};

export function LoginFooter({ metrics, screenWidth }: LoginFooterProps) {
  const footerEntrance = useEntranceAnimation(280);

  return (
    <Animated.View
      style={[
        styles.footerSection,
        { marginTop: metrics.footerTopMargin },
        footerEntrance,
      ]}
    >
      <LoginFooterWave metrics={metrics} screenWidth={screenWidth} />

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
        <LoginFooterArtwork metrics={metrics} screenWidth={screenWidth} />

        <View
          style={[
            styles.footerCopy,
            {
              marginTop: metrics.footerTextGap,
            },
          ]}
        >
          <Text
            style={[
              styles.footerText,
              {
                fontSize: metrics.footerPrimaryFontSize,
              },
            ]}
          >
            Si necesitas ayuda, contacta a
          </Text>
          <Text
            style={[
              styles.footerAccent,
              {
                fontSize: metrics.footerAccentFontSize,
              },
            ]}
          >
            Bienestar Universitario.
          </Text>
        </View>
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
  footerCopy: {
    alignItems: "center",
    alignSelf: "center",
    maxWidth: 292,
  },
  footerText: {
    color: TEXT_MUTED,
    lineHeight: 20,
    textAlign: "center",
  },
  footerAccent: {
    color: ACCENT_ORANGE,
    lineHeight: 22,
    fontWeight: typography.weights.semiBold,
    textAlign: "center",
  },
});
