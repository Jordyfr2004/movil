import React, { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  KeyboardTypeOptions,
  ReturnKeyTypeOptions,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { typography } from "../../theme";
import {
  ACCENT_ORANGE,
  INPUT_BORDER,
  LoginLayoutMetrics,
  SURFACE,
  TEXT_MUTED,
  TEXT_PRIMARY,
} from "./loginTheme";

type LoginTextInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  metrics: LoginLayoutMetrics;
  keyboardType?: KeyboardTypeOptions;
  returnKeyType?: ReturnKeyTypeOptions;
  secureTextEntry?: boolean;
  onSubmitEditing?: () => void;
  trailingAccessory?: React.ReactNode;
  accessibilityLabel?: string;
  textContentType?: TextInputProps["textContentType"];
  autoComplete?: TextInputProps["autoComplete"];
};

export function LoginTextInput({
  value,
  onChangeText,
  placeholder,
  iconName,
  metrics,
  keyboardType,
  returnKeyType,
  secureTextEntry,
  onSubmitEditing,
  trailingAccessory,
  accessibilityLabel,
  textContentType,
  autoComplete,
}: LoginTextInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      style={[
        styles.inputShell,
        {
          height: metrics.inputHeight,
          borderRadius: metrics.inputRadius,
        },
        isFocused && styles.inputShellFocused,
      ]}
    >
      <MaterialCommunityIcons
        name={iconName}
        size={24}
        color={ACCENT_ORANGE}
        accessible={false}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={TEXT_MUTED}
        keyboardType={keyboardType}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry={secureTextEntry}
        selectionColor={ACCENT_ORANGE}
        accessibilityLabel={accessibilityLabel}
        textContentType={textContentType}
        autoComplete={autoComplete}
        style={[
          styles.input,
          {
            height: metrics.inputHeight,
          },
        ]}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
      />
      {trailingAccessory}
    </View>
  );
}

const styles = StyleSheet.create({
  inputShell: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: INPUT_BORDER,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#DAB690",
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  inputShellFocused: {
    borderColor: ACCENT_ORANGE,
    shadowColor: ACCENT_ORANGE,
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },
  input: {
    flex: 1,
    color: TEXT_PRIMARY,
    fontSize: typography.sizes.md,
    paddingVertical: 0,
  },
});
