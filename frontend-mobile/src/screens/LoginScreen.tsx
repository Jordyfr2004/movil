import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
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
import { colors, typography } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.Login>;

const SCREEN_BACKGROUND = "#F6EFE8";
const AVATAR_BACKGROUND = "rgba(191, 156, 141, 0.28)";
const INPUT_BACKGROUND = "rgba(255, 255, 255, 0.98)";
const INPUT_BORDER = "rgba(231, 225, 218, 0.96)";
const ENTRANCE_DURATION = 420;
const ENTRANCE_OFFSET = 10;
const ENTRANCE_EASING = Easing.out(Easing.cubic);
const LOGIN_LOGO = require("../assets/images/logo_proyect.jpeg");

const decorativeIcons = [
  {
    name: "silverware-fork-knife",
    size: 70,
    color: "rgba(191, 156, 141, 0.13)",
    style: { top: 34, left: 6, transform: [{ rotate: "-14deg" }] },
  },
  {
    name: "food-apple-outline",
    size: 62,
    color: "rgba(201, 168, 149, 0.12)",
    style: { top: 96, right: 8, transform: [{ rotate: "12deg" }] },
  },
  {
    name: "coffee-outline",
    size: 54,
    color: "rgba(191, 156, 141, 0.11)",
    style: { top: 226, left: 2, transform: [{ rotate: "-10deg" }] },
  },
  {
    name: "bread-slice-outline",
    size: 56,
    color: "rgba(201, 168, 149, 0.12)",
    style: { top: 286, right: 18, transform: [{ rotate: "-10deg" }] },
  },
  {
    name: "food-croissant",
    size: 48,
    color: "rgba(191, 156, 141, 0.1)",
    style: { top: "41%", left: 22, transform: [{ rotate: "-8deg" }] },
  },
  {
    name: "cupcake",
    size: 46,
    color: "rgba(201, 168, 149, 0.11)",
    style: { top: "45%", right: 24, transform: [{ rotate: "10deg" }] },
  },
  {
    name: "chef-hat",
    size: 52,
    color: "rgba(191, 156, 141, 0.11)",
    style: { bottom: 178, left: 22, transform: [{ rotate: "-8deg" }] },
  },
  {
    name: "hamburger",
    size: 66,
    color: "rgba(201, 168, 149, 0.14)",
    style: { bottom: 122, right: 2, transform: [{ rotate: "9deg" }] },
  },
  {
    name: "pizza",
    size: 60,
    color: "rgba(191, 156, 141, 0.11)",
    style: { bottom: 40, left: 8, transform: [{ rotate: "-12deg" }] },
  },
  {
    name: "ice-cream",
    size: 52,
    color: "rgba(201, 168, 149, 0.12)",
    style: { bottom: 38, right: 32, transform: [{ rotate: "12deg" }] },
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
  const backgroundScale = isCompact ? 0.9 : 1;
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
      headerTintColor: colors.textPrimary,
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
        <View style={styles.background} pointerEvents="none">
          {decorativeIcons.map((icon, index) => (
            <MaterialCommunityIcons
              key={`${icon.name}-${index}`}
              name={icon.name}
              size={icon.size * backgroundScale}
              color={icon.color}
              style={[styles.backgroundIcon, icon.style]}
            />
          ))}
        </View>

        <View style={styles.layout}>
          <ScrollView
            bounces={false}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingBottom: Math.max(insets.bottom, spacing.lg),
                paddingTop: isCompact ? spacing.md : spacing.lg,
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
                      resizeMode="cover"
                    />
                  </View>
                </Animated.View>

                <Animated.View style={[styles.titleBlock, titleEntrance]}>
                  <Text style={[styles.title, isCompact && styles.titleCompact]}>
                    Inicia sesión
                  </Text>
                </Animated.View>

                <Animated.View
                  style={[styles.formSection, isCompact && styles.formCompact, formEntrance]}
                >
                  <View
                    style={[
                      styles.inputShell,
                      focusedField === "email" && styles.inputShellFocused,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="email-outline"
                      size={20}
                      color={
                        focusedField === "email"
                          ? colors.primary
                          : colors.textMuted
                      }
                    />
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Correo"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      selectionColor={colors.primary}
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
                      color={
                        focusedField === "password"
                          ? colors.primary
                          : colors.textMuted
                      }
                    />
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Contraseña"
                      placeholderTextColor={colors.textMuted}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      selectionColor={colors.primary}
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
                        color={colors.textMuted}
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
                            color={colors.onPrimary}
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

              <Animated.Text style={[styles.footerText, footerEntrance]}>
                {"Si necesitas ayuda, contacta a "}
                <Text style={styles.footerAccent}>Bienestar Universitario</Text>
                .
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
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundIcon: {
    position: "absolute",
  },
  layout: {
    flex: 1,
    paddingHorizontal: spacing.lg,
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
    justifyContent: "center",
    alignItems: "center",
  },
  avatarBlock: {
    alignItems: "center",
  },
  avatarCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: AVATAR_BACKGROUND,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3A281F",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 1,
  },
  avatarCircleCompact: {
    width: 92,
    height: 92,
    borderRadius: 46,
  },
  logoImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  logoImageCompact: {
    width: 84,
    height: 84,
    borderRadius: 42,
  },
  titleBlock: {
    marginTop: spacing.lg,
    alignItems: "center",
  },
  title: {
    color: colors.textPrimary,
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
    marginTop: 18,
    paddingHorizontal: spacing.xs,
    gap: spacing.md,
  },
  formCompact: {
    marginTop: spacing.md,
  },
  inputShell: {
    height: 58,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: INPUT_BORDER,
    backgroundColor: INPUT_BACKGROUND,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    shadowColor: "#34241C",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },
  inputShellFocused: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  input: {
    flex: 1,
    height: 58,
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    paddingVertical: 0,
  },
  trailingIconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
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
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  rememberText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
  },
  forgotButton: {
    flex: 1,
    paddingVertical: spacing.xs,
  },
  forgotText: {
    color: colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
    lineHeight: typography.lineHeights.sm,
    textAlign: "right",
  },
  primaryButton: {
    height: 58,
    marginTop: spacing.xs,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2E2018",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonLabel: {
    color: colors.onPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    lineHeight: typography.lineHeights.md,
    letterSpacing: 0.6,
  },
  footerText: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
    color: colors.textMuted,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
    textAlign: "center",
  },
  footerAccent: {
    color: colors.primary,
    fontWeight: typography.weights.semiBold,
  },
  pressablePressed: {
    opacity: 0.96,
    transform: [{ translateY: 1 }, { scale: 0.985 }],
  },
});
