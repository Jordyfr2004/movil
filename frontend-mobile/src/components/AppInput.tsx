import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors, designSystem, typography } from "../theme";
import { spacing } from "../constants/spacing";

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
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          isFocused && styles.inputFocused,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        selectionColor={colors.primary}
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
    color: colors.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: designSystem.radii.input,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: designSystem.components.input.minHeight,
    fontSize: typography.roles.body.fontSize,
    lineHeight: typography.roles.body.lineHeight,
    color: colors.textPrimary,
    backgroundColor: colors.surfaceElevated,
  },
  inputMultiline: {
    minHeight: 96,
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
});
