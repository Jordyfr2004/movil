import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Svg, { Path } from "react-native-svg";
import {
  Alert,
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { spacing } from "../constants/spacing";
import { ROUTES } from "../navigation/routes";
import { RootStackParamList } from "../navigation/types";
import { loginRequest } from "../services/authServices";
import { typography } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.Login>;

const SCREEN_BACKGROUND = "#F8E6CF";
const ACCENT_ORANGE = "#F97316";
const BUTTON_ORANGE = "#FF6500";
const LINK_ORANGE = "#E85D2A";
const TEXT_PRIMARY = "#2F241E";
const TEXT_SECONDARY = "#5A4B42";
const TEXT_MUTED = "#7B6F67";
const AVATAR_BACKGROUND = "#FFFFFF";
const INPUT_BACKGROUND = "#FFFFFF";
const INPUT_BORDER = "#F0D8C2";
const WAVE_ICON_COLOR = "rgba(249, 115, 22, 0.26)";
const ENTRANCE_DURATION = 420;
const ENTRANCE_OFFSET = 10;
const ENTRANCE_EASING = Easing.out(Easing.cubic);
const LOGIN_LOGO = require("../assets/images/logo_proyect.jpeg");

type DecorIconProps = {
  color: string;
  size: number;
};

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

const interpolate = (min: number, max: number, progress: number) => {
  return Math.round(min + (max - min) * progress);
};

function useEntranceAnimation(delay: number) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(ENTRANCE_OFFSET)).current;

  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(ENTRANCE_OFFSET);

    const animation = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: ENTRANCE_DURATION,
          easing: ENTRANCE_EASING,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: ENTRANCE_DURATION,
          easing: ENTRANCE_EASING,
          useNativeDriver: true,
        }),
      ]),
    ]);

    animation.start();

    return () => {
      animation.stop();
    };
  }, [delay, opacity, translateY]);

  return {
    opacity,
    transform: [{ translateY }],
  };
}

function DecorBowlIcon({ color, size }: DecorIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path
        d="M16 37 H48"
        stroke={color}
        strokeWidth={3.4}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M20 37 C22 47 42 47 44 37"
        stroke={color}
        strokeWidth={3.4}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M26 28 C22 24 30 21 26 17"
        stroke={color}
        strokeWidth={2.8}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M36 28 C32 24 40 21 36 17"
        stroke={color}
        strokeWidth={2.8}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M46 28 L53 21"
        stroke={color}
        strokeWidth={2.8}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function DecorCupIcon({ color, size }: DecorIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path
        d="M23 23 H43 L40 51 H26 Z"
        stroke={color}
        strokeWidth={3.4}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M28 32 H38"
        stroke={color}
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M33 14 V23"
        stroke={color}
        strokeWidth={2.8}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function DecorLeafIcon({ color, size }: DecorIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path
        d="M16 39 C24 22 42 17 51 20 C47 35 35 45 20 43 C18 42 17 41 16 39 Z"
        stroke={color}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20 40 C30 35 39 28 49 21"
        stroke={color}
        strokeWidth={2.3}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M19 43 L12 52"
        stroke={color}
        strokeWidth={2.6}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function LoginScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const bodyHeight = Math.max(height - 96, 560);
  const sizeProgress = clamp((bodyHeight - 560) / 160, 0, 1);

  const horizontalPadding = 24;
  const topPadding = interpolate(14, 18, sizeProgress);
  const logoTopSpacing = interpolate(8, 12, sizeProgress);
  const logoContainerSize = interpolate(108, 116, sizeProgress);
  const logoSize = interpolate(96, 104, sizeProgress);
  const logoTitleSpacing = interpolate(12, 14, sizeProgress);
  const titleSize = interpolate(31, 33, sizeProgress);
  const titleLineHeight = titleSize + 4;
  const inputHeight = interpolate(60, 62, sizeProgress);
  const buttonHeight = interpolate(58, 60, sizeProgress);
  const buttonTopSpacing = interpolate(12, 14, sizeProgress);
  const buttonCurveGap = interpolate(8, 10, sizeProgress);
  const waveHeight = interpolate(230, 242, sizeProgress);
  const contentBottomPadding = waveHeight + buttonCurveGap;
  const footerBottomOffset = Math.max(insets.bottom + 24, 34);

  const waveWidth = Math.max(width, 320);
  const waveLeftY = Math.round(clamp(waveHeight * 0.09, 20, 24));
  const waveCenterY = Math.round(clamp(waveHeight * 0.29, 66, 72));
  const waveRightY = Math.round(clamp(waveHeight * 0.08, 18, 22));
  const wavePath = [
    `M 0 ${waveLeftY}`,
    `C ${waveWidth * 0.14} ${waveLeftY - 10}, ${waveWidth * 0.31} ${waveCenterY - 4}, ${waveWidth * 0.52} ${waveCenterY}`,
    `C ${waveWidth * 0.71} ${waveCenterY + 3}, ${waveWidth * 0.87} ${waveRightY - 8}, ${waveWidth} ${waveRightY}`,
    `L ${waveWidth} ${waveHeight}`,
    `L 0 ${waveHeight}`,
    "Z",
  ].join(" ");

  const iconBandTop = Math.round(clamp(waveHeight * 0.32, 74, 84));
  const accentIcons = [
    {
      name: "circle-medium" as const,
      size: 18,
      style: {
        top: iconBandTop + 24,
        left: "5.5%",
      },
    },
    {
      name: "circle-medium" as const,
      size: 18,
      style: {
        top: iconBandTop + 48,
        left: "62.5%",
      },
    },
    {
      name: "star-four-points-outline" as const,
      size: 18,
      style: {
        top: iconBandTop + 64,
        left: "10.5%",
      },
    },
    {
      name: "star-four-points-outline" as const,
      size: 18,
      style: {
        top: iconBandTop - 4,
        right: "6.5%",
      },
    },
  ];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(
    null
  );
  const avatarEntrance = useEntranceAnimation(40);
  const titleEntrance = useEntranceAnimation(130);
  const formEntrance = useEntranceAnimation(220);
  const footerEntrance = useEntranceAnimation(300);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Iniciar sesión",
      headerShadowVisible: false,
      headerTintColor: TEXT_PRIMARY,
      headerStyle: {
        backgroundColor: SCREEN_BACKGROUND,
      },
    });
  }, [navigation]);

  const isValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (!normalizedEmail) {
      Alert.alert("Validación", "Debes ingresar tu correo");
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      Alert.alert("Validación", "Ingresa un correo válido");
      return;
    }

    if (!normalizedPassword) {
      Alert.alert("Validación", "Debes ingresar tu contraseña");
      return;
    }

    try {
      setLoading(true);

      const result = await loginRequest({
        email: normalizedEmail,
        password: normalizedPassword,
      });

      const authResult = result as typeof result & {
        data?: {
          access_token?: string;
          data?: {
            access_token?: string;
          };
        };
      };

      const token =
        authResult.access_token ||
        authResult.data?.access_token ||
        authResult.data?.data?.access_token;

      if (!token) {
        Alert.alert(
          "Error",
          "El servidor respondió correctamente, pero no devolvió el token"
        );
        return;
      }

      Alert.alert("Éxito", "Inicio de sesión correcto");
      navigation.replace(ROUTES.Home);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al iniciar sesión";

      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Próximamente",
      "La recuperación de contraseña estará disponible pronto."
    );
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={SCREEN_BACKGROUND} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
        style={styles.keyboardAvoiding}
      >
        <View style={styles.container}>
          <View
            style={[
              styles.contentLayer,
              {
                paddingTop: topPadding,
                paddingHorizontal: horizontalPadding,
                paddingBottom: contentBottomPadding,
              },
            ]}
          >
            <View style={styles.topSection}>
              <Animated.View
                style={[
                  styles.avatarBlock,
                  { marginTop: logoTopSpacing },
                  avatarEntrance,
                ]}
              >
                <View
                  style={[
                    styles.avatarCircle,
                    {
                      width: logoContainerSize,
                      height: logoContainerSize,
                      borderRadius: logoContainerSize / 2,
                    },
                  ]}
                >
                  <Image
                    source={LOGIN_LOGO}
                    style={[
                      styles.logoImage,
                      {
                        width: logoSize,
                        height: logoSize,
                      },
                    ]}
                    resizeMode="contain"
                  />
                </View>
              </Animated.View>

              <Animated.View
                style={[
                  styles.titleBlock,
                  { marginTop: logoTitleSpacing },
                  titleEntrance,
                ]}
              >
                <Text
                  style={[
                    styles.title,
                    {
                      fontSize: titleSize,
                      lineHeight: titleLineHeight,
                    },
                  ]}
                >
                  Inicia sesión
                </Text>
              </Animated.View>
            </View>

            <Animated.View style={[styles.formSection, formEntrance]}>
              <View style={styles.fieldsGroup}>
                <View
                  style={[
                    styles.inputShell,
                    { height: inputHeight },
                    focusedField === "email" && styles.inputShellFocused,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="email-outline"
                    size={22}
                    color={ACCENT_ORANGE}
                  />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Correo"
                    placeholderTextColor={TEXT_MUTED}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    selectionColor={ACCENT_ORANGE}
                    style={[styles.input, { height: inputHeight }]}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    returnKeyType="next"
                  />
                </View>

                <View
                  style={[
                    styles.inputShell,
                    { height: inputHeight },
                    focusedField === "password" && styles.inputShellFocused,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="lock-outline"
                    size={22}
                    color={ACCENT_ORANGE}
                  />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Contraseña"
                    placeholderTextColor={TEXT_MUTED}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    selectionColor={ACCENT_ORANGE}
                    style={[styles.input, { height: inputHeight }]}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      showPassword
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                    onPress={() => setShowPassword((current) => !current)}
                    style={({ pressed }) => [
                      styles.trailingIconButton,
                      pressed && styles.pressablePressed,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={22}
                      color={ACCENT_ORANGE}
                    />
                  </Pressable>
                </View>
              </View>

              <View style={styles.optionsRow}>
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: rememberMe }}
                  onPress={() => setRememberMe((current) => !current)}
                  style={({ pressed }) => [
                    styles.rememberButton,
                    pressed && styles.pressablePressed,
                  ]}
                >
                  <View
                    style={[
                      styles.checkbox,
                      rememberMe && styles.checkboxChecked,
                    ]}
                  >
                    {rememberMe ? (
                      <MaterialCommunityIcons
                        name="check"
                        size={14}
                        color="#FFFFFF"
                      />
                    ) : null}
                  </View>
                  <Text style={styles.rememberText}>Recordarme</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={handleForgotPassword}
                  style={({ pressed }) => [
                    styles.forgotButton,
                    pressed && styles.pressablePressed,
                  ]}
                >
                  <Text style={styles.forgotText}>
                    ¿Olvidaste tu contraseña?
                  </Text>
                </Pressable>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={handleLogin}
                disabled={loading}
                style={({ pressed }) => [
                  styles.primaryButton,
                  {
                    height: buttonHeight,
                    marginTop: buttonTopSpacing,
                  },
                  loading && styles.primaryButtonDisabled,
                  pressed && !loading && styles.pressablePressed,
                ]}
              >
                <Text style={styles.primaryButtonLabel}>
                  {loading ? "INGRESANDO..." : "INICIAR SESIÓN"}
                </Text>
              </Pressable>
            </Animated.View>
          </View>

          <View
            pointerEvents="none"
            style={[styles.waveSection, { height: waveHeight }]}
          >
            <Svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${waveWidth} ${waveHeight}`}
              preserveAspectRatio="none"
              style={styles.waveSvg}
            >
              <Path d={wavePath} fill="#FFFFFF" />
            </Svg>

            <View style={styles.bottomIconsLayer}>
              <View style={styles.iconsRow}>
                <DecorBowlIcon color={WAVE_ICON_COLOR} size={50} />
                <DecorCupIcon color={WAVE_ICON_COLOR} size={50} />
                <DecorLeafIcon color={WAVE_ICON_COLOR} size={48} />
              </View>

              {accentIcons.map((icon, index) => (
                <MaterialCommunityIcons
                  key={`${icon.name}-${index}`}
                  name={icon.name}
                  size={icon.size}
                  color={WAVE_ICON_COLOR}
                  style={[styles.bottomWaveIcon, icon.style]}
                />
              ))}
            </View>

            <Animated.View
              style={[
                styles.footerCopy,
                { bottom: footerBottomOffset },
                footerEntrance,
              ]}
            >
              <Text style={styles.footerText}>
                Si necesitas ayuda, contacta a
              </Text>
              <Text style={styles.footerAccent}>
                Bienestar Universitario.
              </Text>
            </Animated.View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: SCREEN_BACKGROUND,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: SCREEN_BACKGROUND,
    overflow: "hidden",
  },
  contentLayer: {
    flex: 1,
    justifyContent: "space-between",
  },
  topSection: {
    width: "100%",
    alignItems: "center",
  },
  avatarBlock: {
    alignItems: "center",
  },
  avatarCircle: {
    backgroundColor: AVATAR_BACKGROUND,
    borderWidth: 1,
    borderColor: "rgba(223, 210, 196, 0.78)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: "#C7A77E",
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  logoImage: {
    borderRadius: 999,
  },
  titleBlock: {
    alignItems: "center",
  },
  title: {
    color: TEXT_PRIMARY,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.2,
    textAlign: "center",
  },
  formSection: {
    width: "100%",
    maxWidth: 388,
    alignSelf: "center",
  },
  fieldsGroup: {
    gap: 12,
  },
  inputShell: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: INPUT_BORDER,
    backgroundColor: INPUT_BACKGROUND,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#D8B48C",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 4,
  },
  inputShellFocused: {
    borderColor: ACCENT_ORANGE,
    shadowColor: ACCENT_ORANGE,
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  input: {
    flex: 1,
    color: TEXT_PRIMARY,
    fontSize: typography.sizes.md,
    paddingVertical: 0,
  },
  trailingIconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  optionsRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  rememberButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexShrink: 0,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#D7C5B8",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: ACCENT_ORANGE,
    borderColor: ACCENT_ORANGE,
  },
  rememberText: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    lineHeight: 18,
  },
  forgotButton: {
    flex: 1,
    paddingVertical: spacing.xs,
  },
  forgotText: {
    color: LINK_ORANGE,
    fontSize: 14,
    fontWeight: typography.weights.semiBold,
    lineHeight: 18,
    textAlign: "right",
  },
  primaryButton: {
    borderRadius: 16,
    backgroundColor: BUTTON_ORANGE,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: BUTTON_ORANGE,
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 7 },
    elevation: 4,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonLabel: {
    color: "#FFFFFF",
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.md,
    letterSpacing: 0.3,
  },
  waveSection: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  waveSvg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomIconsLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomWaveIcon: {
    position: "absolute",
  },
  iconsRow: {
    position: "absolute",
    bottom: 82,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  footerCopy: {
    position: "absolute",
    left: 24,
    right: 24,
    alignItems: "center",
  },
  footerText: {
    color: TEXT_MUTED,
    fontSize: typography.sizes.sm,
    lineHeight: 20,
    textAlign: "center",
  },
  footerAccent: {
    color: ACCENT_ORANGE,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: typography.weights.semiBold,
    textAlign: "center",
  },
  pressablePressed: {
    opacity: 0.96,
    transform: [{ scale: 0.98 }],
  },
});
