import { useMemo } from "react";

import { useAppPreferences } from "../context/AppPreferencesContext";
import { designSystem } from "../theme";

export function useThemeColors() {
  const { resolvedScheme } = useAppPreferences();

  return useMemo(
    () => designSystem.themes[resolvedScheme === "dark" ? "dark" : "light"],
    [resolvedScheme]
  );
}
