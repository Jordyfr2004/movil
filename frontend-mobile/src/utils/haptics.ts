import { AccessibilityInfo, Platform, Vibration } from "react-native";

type FeedbackKind = "selection" | "success" | "warning" | "error";

const PATTERNS: Record<FeedbackKind, number | number[]> = {
  selection: 12,
  success: Platform.OS === "android" ? [0, 18, 24, 18] : 22,
  warning: 36,
  error: Platform.OS === "android" ? [0, 30, 28, 42] : 55,
};

export async function triggerFeedback(kind: FeedbackKind = "selection") {
  try {
    const reduceMotion = await AccessibilityInfo.isReduceMotionEnabled();
    if (reduceMotion) {
      return;
    }
  } catch {
    return;
  }

  Vibration.vibrate(PATTERNS[kind]);
}

