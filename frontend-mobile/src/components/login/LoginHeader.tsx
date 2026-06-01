import React from "react";
import { Animated, Image, StyleSheet, Text } from "react-native";
import { typography } from "../../theme";
import { LOGIN_LOGO, LoginLayoutMetrics, TEXT_PRIMARY } from "./loginTheme";
import { useEntranceAnimation } from "./useEntranceAnimation";

type LoginHeaderProps = {
  metrics: LoginLayoutMetrics;
};

export function LoginHeader({ metrics }: LoginHeaderProps) {
  const logoEntrance = useEntranceAnimation(40);
  const titleEntrance = useEntranceAnimation(120);

  return (
    <>
      <Animated.View
        style={[
          styles.logoBlock,
          {
            width: metrics.logoImageSize,
            height: metrics.logoImageSize,
          },
          logoEntrance,
        ]}
      >
        <Image
          source={LOGIN_LOGO}
          resizeMode="contain"
          style={[
            styles.logoImage,
            {
              width: metrics.logoImageSize,
              height: metrics.logoImageSize,
            },
          ]}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.titleBlock,
          { marginTop: metrics.titleTopMargin },
          titleEntrance,
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
          Inicia sesión
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
    backgroundColor: "transparent",
  },
  logoImage: {
    alignSelf: "center",
    backgroundColor: "transparent",
  },
  titleBlock: {
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    color: TEXT_PRIMARY,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.2,
  },
});
