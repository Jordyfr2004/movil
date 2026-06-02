import React from "react";
import Svg, { Path } from "react-native-svg";
import { StyleSheet } from "react-native";
import { SURFACE, WelcomeLayoutMetrics } from "./welcomeTheme";

type WelcomeFooterWaveProps = {
  metrics: WelcomeLayoutMetrics;
  screenWidth: number;
};

export function WelcomeFooterWave({
  metrics,
  screenWidth,
}: WelcomeFooterWaveProps) {
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
    <Svg
      width="100%"
      height={metrics.waveHeight}
      viewBox={`0 0 ${waveWidth} ${metrics.waveHeight}`}
      preserveAspectRatio="none"
      style={styles.waveSvg}
      accessible={false}
    >
      <Path d={wavePath} fill={SURFACE} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  waveSvg: {
    width: "100%",
  },
});
