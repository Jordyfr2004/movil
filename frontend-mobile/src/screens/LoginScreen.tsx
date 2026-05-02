import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Svg, { Path } from "react-native-svg";
import {
  Alert,
  Animated,
  Easing,
  Image,
  Pressable,
  ScrollView,
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
const WAVE_ICON_COLOR = "rgba(249, 115, 22, 0.24)";
const ENTRANCE_DURATION = 420;
const ENTRANCE_OFFSET = 10;
const ENTRANCE_EASING = Easing.out(Easing.cubic);
const LOGIN_LOGO = require("../assets/images/logo_proyect.jpeg");

const bottomWaveIcons = [
  {
    name: "bowl-mix-outline",
    size: 54,
    style: { top: 8, left: 72 },
  },
  {
    name: "cup-outline",
    size: 52,
    style: { top: 20, left: "50%", marginLeft: -26 },
  },
  {
    name: "leaf",
    size: 50,
    style: { top: 22, right: 74 },
  },
  {
    name: "circle-small",
    size: 22,
    style: { top: 42, left: 26 },
  },
  {
    name: "star-four-points-outline",
    size: 22,
    style: { top: 14, right: 34 },
  },
] as const;

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

export function LoginScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const isCompact = height < 760 || width < 360;
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

      <View style={styles.container}>
        <View pointerEvents="none" style={styles.bottomDecorLayer}>
          <Svg
            width="100%"
            height={260}
            viewBox="0 0 390 260"
            preserveAspectRatio="none"
            style={styles.waveSvg}
          >
            <Path
              d="M0 58 C70 18 128 26 192 50 C260 76 320 58 390 12 L390 260 L0 260 Z"
              fill="#FFFFFF"
            />
          </Svg>

          <View style={styles.bottomIconsLayer}>
            {bottomWaveIcons.map((icon, index) => (
              <MaterialCommunityIcons
                key={`${icon.name}-${index}`}
                name={icon.name}
                size={icon.size}
                color={WAVE_ICON_COLOR}
                style={[styles.bottomWaveIcon, icon.style]}
              />
            ))}
          </View>
        </View>

        <View style={styles.layout}>
          <ScrollView
            bounces={false}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingTop: isCompact ? 44 : 58,
              },
            ]}
          >
            <View style={styles.scrollInner}>
              <View style={styles.mainContent}>
                <Animated.View style={[styles.avatarBlock, avatarEntrance]}>
                  <View
                    style={[
                      styles.avatarCircle,
                      isCompact && styles.avatarCircleCompact,
                    ]}
                  >
                    <Image
                      source={LOGIN_LOGO}
                      style={[styles.logoImage, isCompact && styles.logoImageCompact]}
                      resizeMode="contain"
                    />
                  </View>
                </Animated.View>

                <Animated.View style={[styles.titleBlock, titleEntrance]}>
                  <Text style={[styles.title, isCompact && styles.titleCompact]}>
                    Inicia sesión
                  </Text>
                </Animated.View>

                <Animated.View style={[styles.formSection, formEntrance]}>
                  <View
                    style={[
                      styles.inputShell,
                      focusedField === "email" && styles.inputShellFocused,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="email-outline"
                      size={20}
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
                      style={styles.input}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      returnKeyType="next"
                    />
                  </View>

                  <View
                    style={[
                      styles.inputShell,
                      focusedField === "password" && styles.inputShellFocused,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="lock-outline"
                      size={20}
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
                      style={styles.input}
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
                        size={20}
                        color={ACCENT_ORANGE}
                      />
                    </Pressable>
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

              <Animated.Text
                style={[
                  styles.footerText,
                  { paddingBottom: insets.bottom + 30 },
                  footerEntrance,
                ]}
              >
                {"Si necesitas ayuda, contacta a "}
                <Text style={styles.footerAccent}>Bienestar Universitario.</Text>
              </Animated.Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: SCREEN_BACKGROUND,
  },
  container: {
    flex: 1,
    backgroundColor: SCREEN_BACKGROUND,
    overflow: "hidden",
  },
  layout: {
    flex: 1,
    paddingHorizontal: 24,
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  scrollInner: {
    flex: 1,
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    justifyContent: "space-between",
  },
  mainContent: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  avatarBlock: {
    alignItems: "center",
  },
  avatarCircle: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: AVATAR_BACKGROUND,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#A68A75",
    shadowOpacity: 0.14,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  avatarCircleCompact: {
    width: 116,
    height: 116,
    borderRadius: 58,
  },
  logoImage: {
    width: 98,
    height: 98,
    borderRadius: 49,
  },
  logoImageCompact: {
    width: 98,
    height: 98,
    borderRadius: 49,
  },
  titleBlock: {
    marginTop: 32,
    alignItems: "center",
  },
  title: {
    color: TEXT_PRIMARY,
    fontSize: 32,
    fontWeight: typography.weights.bold,
    lineHeight: 38,
    letterSpacing: 0.2,
    textAlign: "center",
  },
  titleCompact: {
    fontSize: 28,
    lineHeight: 34,
  },
  formSection: {
    width: "100%",
    maxWidth: 360,
    marginTop: 28,
    paddingHorizontal: 0,
    gap: 16,
  },
  inputShell: {
    height: 58,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: INPUT_BORDER,
    backgroundColor: INPUT_BACKGROUND,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#A68A75",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  inputShellFocused: {
    borderColor: ACCENT_ORANGE,
    shadowColor: ACCENT_ORANGE,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  input: {
    flex: 1,
    height: 58,
    color: TEXT_PRIMARY,
    fontSize: typography.sizes.md,
    paddingVertical: 0,
  },
  trailingIconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  optionsRow: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
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
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
  },
  forgotButton: {
    flex: 1,
    paddingVertical: spacing.xs,
  },
  forgotText: {
    color: LINK_ORANGE,
    fontSize: 13,
    fontWeight: typography.weights.semiBold,
    lineHeight: typography.lineHeights.sm,
    textAlign: "right",
  },
  primaryButton: {
    height: 58,
    marginTop: spacing.xs,
    borderRadius: 16,
    backgroundColor: BUTTON_ORANGE,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: BUTTON_ORANGE,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
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
  footerText: {
    marginTop: 0,
    paddingTop: 132,
    paddingHorizontal: 28,
    width: "100%",
    color: TEXT_MUTED,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    textAlign: "center",
    zIndex: 3,
  },
  footerAccent: {
    color: ACCENT_ORANGE,
    fontWeight: typography.weights.semiBold,
  },
  bottomDecorLayer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 270,
    zIndex: 0,
  },
  waveSvg: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomIconsLayer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 74,
    height: 110,
    zIndex: 2,
  },
  bottomWaveIcon: {
    position: "absolute",
  },
  pressablePressed: {
    opacity: 0.96,
    transform: [{ scale: 0.98 }],
  },
});
