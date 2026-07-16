import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { designSystem, typography } from "../theme";
import { spacing } from "../constants/spacing";
import { useThemeColors } from "../hooks/useThemeColors";

type AppInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

export function AppInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  multiline,
  numberOfLines,
  maxLength,
  accessibilityLabel,
  accessibilityHint,
}: AppInputProps) {
  const theme = useThemeColors();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          {
            color: theme.textPrimary,
            backgroundColor: isFocused ? theme.surface : theme.surfaceElevated,
            borderColor: isFocused ? theme.primary : theme.border,
          },
          multiline && styles.inputMultiline,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        selectionColor={theme.primary}
        multiline={multiline}
        numberOfLines={numberOfLines}
        maxLength={maxLength}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={accessibilityHint}
        textAlignVertical={multiline ? "top" : "center"}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.roles.label.fontSize,
    lineHeight: typography.roles.label.lineHeight,
    fontWeight: typography.roles.label.fontWeight,
  },
  input: {
    borderWidth: 1,
    borderRadius: designSystem.radii.input,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: designSystem.components.input.minHeight,
    fontSize: typography.roles.body.fontSize,
    lineHeight: typography.roles.body.lineHeight,
  },
  inputMultiline: {
    minHeight: 96,
  },
});
