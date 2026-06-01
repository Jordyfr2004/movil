import React from "react";
import Svg, { Path } from "react-native-svg";

type DecorIconProps = {
  color: string;
  size: number;
};

export function DecorBowlIcon({ color, size }: DecorIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 72 72">
      <Path
        d="M18 42 H54"
        stroke={color}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M22 42 C25 52 47 52 50 42"
        stroke={color}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M28 31 C24 27 32 24 28 19"
        stroke={color}
        strokeWidth={2.6}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M38 31 C34 27 42 24 38 19"
        stroke={color}
        strokeWidth={2.6}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M48 32 L55 25"
        stroke={color}
        strokeWidth={2.6}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function DecorCupIcon({ color, size }: DecorIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 72 72">
      <Path
        d="M27 23 H45 L42 53 H30 Z"
        stroke={color}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M32 33 H40"
        stroke={color}
        strokeWidth={2.4}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M36 14 V23"
        stroke={color}
        strokeWidth={2.6}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function DecorLeafIcon({ color, size }: DecorIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 72 72">
      <Path
        d="M18 43 C27 24 47 18 57 22 C52 39 39 50 23 47 C20 46 19 45 18 43 Z"
        stroke={color}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M23 44 C34 39 43 31 55 24"
        stroke={color}
        strokeWidth={2.3}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M22 47 L15 57"
        stroke={color}
        strokeWidth={2.6}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}
