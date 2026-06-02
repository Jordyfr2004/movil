import React from "react";
import { Animated, Image, StyleSheet, Text } from "react-native";
import { typography } from "../../theme";
import {
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  WELCOME_LOGO,
  WelcomeLayoutMetrics,
} from "./welcomeTheme";
import { useWelcomeEntranceAnimation } from "./useWelcomeEntranceAnimation";

type WelcomeHeaderProps = {
  metrics: WelcomeLayoutMetrics;
};

export function WelcomeHeader({ metrics }: WelcomeHeaderProps) {
  const logoEntrance = useWelcomeEntranceAnimation(40);
  const textEntrance = useWelcomeEntranceAnimation(130);

  return (
    <>
      <Animated.View
        style={[
          styles.logoBlock,
          {
            width: metrics.logoSize,
            height: metrics.logoSize,
          },
          logoEntrance,
        ]}
      >
        <Image
          source={WELCOME_LOGO}
          resizeMode="contain"
          style={[
            styles.logoImage,
            {
              width: metrics.logoSize,
              height: metrics.logoSize,
            },
          ]}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.textBlock,
          { marginTop: metrics.titleTopMargin },
          textEntrance,
        ]}
      >
        <Text
          style={[
            styles.title,
            {
              fontSize: metrics.titleSize,
              lineHeight: metrics.titleLineHeight,
            },
          ]}
        >
          Comedor ULEAM
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              marginTop: metrics.subtitleTopMargin,
              fontSize: metrics.subtitleSize,
              lineHeight: metrics.subtitleLineHeight,
            },
          ]}
        >
          Selecciona tu tipo de usuario para continuar
        </Text>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  logoBlock: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  logoImage: {
    alignSelf: "center",
    backgroundColor: "transparent",
  },
  textBlock: {
    width: "100%",
    alignItems: "center",
  },
  title: {
    color: TEXT_PRIMARY,
    fontWeight: typography.weights.semiBold,
    textAlign: "center",
    letterSpacing: 0.15,
  },
  subtitle: {
    maxWidth: 308,
    color: TEXT_SECONDARY,
    textAlign: "center",
    fontWeight: typography.weights.regular,
  },
});
