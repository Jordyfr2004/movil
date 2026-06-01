import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { LoginLayoutMetrics, SURFACE } from "./loginTheme";

type LoginFooterWaveProps = {
  metrics: LoginLayoutMetrics;
  screenWidth: number;
};

export function LoginFooterWave({
  metrics,
  screenWidth,
}: LoginFooterWaveProps) {
  const waveWidth = Math.max(screenWidth, 320);
  const wavePath = [
    `M 0 ${Math.round(metrics.waveHeight * 0.44)}`,
    `C ${Math.round(waveWidth * 0.15)} ${Math.round(metrics.waveHeight * 0.18)}, ${Math.round(
      waveWidth * 0.34
    )} ${Math.round(metrics.waveHeight * 0.82)}, ${Math.round(waveWidth * 0.52)} ${Math.round(
      metrics.waveHeight * 0.68
    )}`,
    `C ${Math.round(waveWidth * 0.7)} ${Math.round(metrics.waveHeight * 0.54)}, ${Math.round(
      waveWidth * 0.86
    )} ${Math.round(metrics.waveHeight * 0.14)}, ${waveWidth} ${Math.round(
      metrics.waveHeight * 0.3
    )}`,
    `L ${waveWidth} ${metrics.waveHeight}`,
    `L 0 ${metrics.waveHeight}`,
    "Z",
  ].join(" ");

  return (
    <View
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg
        width="100%"
        height={metrics.waveHeight}
        viewBox={`0 0 ${waveWidth} ${metrics.waveHeight}`}
        preserveAspectRatio="none"
        style={styles.waveSvg}
      >
        <Path d={wavePath} fill={SURFACE} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  waveSvg: {
    width: "100%",
  },
});
