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

const SCREEN_BACKGROUND = "#F7E5CC";
const SURFACE = "#FFFFFF";
const ACCENT_ORANGE = "#F97316";
const BUTTON_ORANGE = "#FF6A00";
const LINK_ORANGE = "#EA6B2F";
const TEXT_PRIMARY = "#2D221B";
const TEXT_SECONDARY = "#5F5048";
const TEXT_MUTED = "#8A7B73";
const INPUT_BORDER = "#F1DCC8";
const DECOR_ORANGE = "rgba(249, 115, 22, 0.28)";
const DECOR_ORANGE_SOFT = "rgba(249, 115, 22, 0.20)";
const ENTRANCE_DURATION = 420;
const ENTRANCE_OFFSET = 10;
const ENTRANCE_EASING = Easing.out(Easing.cubic);
const LOGIN_LOGO = require("../assets/images/logo_comedor_uleam_institucional_final.png");

type DecorIconProps = {
  color: string;
  size: number;
};

type LoginLayoutMetrics = {
  horizontalPadding: number;
  contentTopPadding: number;
  logoImageSize: number;
  titleTopMargin: number;
  titleSize: number;
  titleLineHeight: number;
  formTopMargin: number;
  fieldGap: number;
  inputHeight: number;
  inputRadius: number;
  buttonHeight: number;
  buttonRadius: number;
  buttonTopMargin: number;
  footerTopMargin: number;
  waveHeight: number;
  footerPanelTopPadding: number;
  footerPanelBottomPadding: number;
  footerArtHeight: number;
  footerArtLift: number;
  footerIconSize: number;
  footerTextGap: number;
  footerPrimaryFontSize: number;
  footerAccentFontSize: number;
};

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

const getLayoutMetrics = (
  width: number,
  height: number,
  bottomInset: number
): LoginLayoutMetrics => {
  const compactHeightProgress = clamp((height - 700) / 220, 0, 1);

  return {
    horizontalPadding: clamp(Math.round(width * 0.06), 22, 28),
    contentTopPadding: clamp(Math.round(height * 0.025), 18, 26),
    logoImageSize: clamp(Math.round(width * 0.395), 148, 168),
    titleTopMargin: clamp(Math.round(width * 0.048), 16, 22),
    titleSize: clamp(Math.round(width * 0.09), 34, 38),
    titleLineHeight: clamp(Math.round(width * 0.1), 40, 44),
    formTopMargin: clamp(Math.round(width * 0.056), 18, 24),
    fieldGap: clamp(Math.round(width * 0.03), 12, 14),
    inputHeight: clamp(Math.round(width * 0.165), 62, 68),
    inputRadius: clamp(Math.round(width * 0.05), 18, 22),
    buttonHeight: clamp(Math.round(width * 0.16), 58, 64),
    buttonRadius: clamp(Math.round(width * 0.04), 16, 18),
    buttonTopMargin: clamp(Math.round(width * 0.038), 12, 16),
    footerTopMargin: clamp(
      Math.round(height * (0.014 + compactHeightProgress * 0.003)),
      10,
      18
    ),
    waveHeight: clamp(Math.round(width * 0.142), 52, 62),
    footerPanelTopPadding: clamp(Math.round(width * 0.006), 0, 3),
    footerPanelBottomPadding: Math.max(bottomInset + 20, 30),
    footerArtHeight: clamp(Math.round(width * 0.225), 78, 92),
    footerArtLift: clamp(Math.round(width * 0.072), 24, 28),
    footerIconSize: clamp(Math.round(width * 0.15), 54, 64),
    footerTextGap: clamp(Math.round(width * 0.02), 6, 8),
    footerPrimaryFontSize: clamp(Math.round(width * 0.036), 15, 16),
    footerAccentFontSize: clamp(Math.round(width * 0.041), 17, 18),
  };
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

function DecorCupIcon({ color, size }: DecorIconProps) {
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

function DecorLeafIcon({ color, size }: DecorIconProps) {
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

export function LoginScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const metrics = getLayoutMetrics(width, height, insets.bottom);
  const waveWidth = Math.max(width, 320);
  const footerArtWidth = Math.min(width - metrics.horizontalPadding * 2, 320);
  const bowlSize = metrics.footerIconSize;
  const glassSize = metrics.footerIconSize - 2;
  const leafSize = metrics.footerIconSize - 4;
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

  const footerAccentIcons = [
    {
      name: "circle-medium" as const,
      size: clamp(Math.round(metrics.footerIconSize * 0.24), 12, 16),
      style: {
        top: Math.round(metrics.footerArtHeight * 0.28),
        left: Math.round(footerArtWidth * 0.02),
      },
    },
    {
      name: "circle-medium" as const,
      size: clamp(Math.round(metrics.footerIconSize * 0.24), 12, 16),
      style: {
        top: Math.round(metrics.footerArtHeight * 0.58),
        left: Math.round(footerArtWidth * 0.67),
      },
    },
    {
      name: "star-four-points-outline" as const,
      size: clamp(Math.round(metrics.footerIconSize * 0.28), 16, 18),
      style: {
        top: Math.round(metrics.footerArtHeight * 0.74),
        left: Math.round(footerArtWidth * 0.1),
      },
    },
    {
      name: "star-four-points-outline" as const,
      size: clamp(Math.round(metrics.footerIconSize * 0.28), 16, 18),
      style: {
        top: Math.round(metrics.footerArtHeight * 0.12),
        right: Math.round(footerArtWidth * 0.02),
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

  const logoEntrance = useEntranceAnimation(40);
  const titleEntrance = useEntranceAnimation(120);
  const formEntrance = useEntranceAnimation(200);
  const footerEntrance = useEntranceAnimation(280);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "",
      headerTitle: "",
      headerShadowVisible: false,
      headerTintColor: TEXT_PRIMARY,
      headerStyle: {
        backgroundColor: SCREEN_BACKGROUND,
      },
      headerTitleStyle: {
        color: TEXT_PRIMARY,
        fontWeight: typography.weights.semiBold,
        fontSize: typography.sizes.md,
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
          <ScrollView
            scrollEnabled={false}
            bounces={false}
            alwaysBounceVertical={false}
            overScrollMode="never"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.screenLayout}>
              <View
                style={[
                  styles.mainSection,
                  {
                    paddingTop: metrics.contentTopPadding,
                    paddingHorizontal: metrics.horizontalPadding,
                  },
                ]}
              >
                <Animated.View
                  style={[
                    styles.logoBlock,
                    {
                      width: metrics.logoImageSize,
                      height: metrics.logoImageSize,
                    },
                    logoEntrance,
                  ]}
                >
                  <Image
                    source={LOGIN_LOGO}
                    resizeMode="contain"
                    style={[
                      styles.logoImage,
                      {
                        width: metrics.logoImageSize,
                        height: metrics.logoImageSize,
                      },
                    ]}
                  />
                </Animated.View>

                <Animated.View
                  style={[
                    styles.titleBlock,
                    { marginTop: metrics.titleTopMargin },
                    titleEntrance,
                  ]}
                >
                  <Text
                    style={[
                      styles.title,
                      {
                        fontSize: metrics.titleSize,
                        lineHeight: metrics.titleLineHeight,
                      },
                    ]}
                  >
                    Inicia sesión
                  </Text>
                </Animated.View>

                <Animated.View
                  style={[
                    styles.formSection,
                    {
                      marginTop: metrics.formTopMargin,
                    },
                    formEntrance,
                  ]}
                >
                  <View style={[styles.fieldsGroup, { gap: metrics.fieldGap }]}>
                    <View
                      style={[
                        styles.inputShell,
                        {
                          height: metrics.inputHeight,
                          borderRadius: metrics.inputRadius,
                        },
                        focusedField === "email" && styles.inputShellFocused,
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="email-outline"
                        size={24}
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
                        style={[
                          styles.input,
                          {
                            height: metrics.inputHeight,
                          },
                        ]}
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => setFocusedField(null)}
                        returnKeyType="next"
                      />
                    </View>

                    <View
                      style={[
                        styles.inputShell,
                        {
                          height: metrics.inputHeight,
                          borderRadius: metrics.inputRadius,
                        },
                        focusedField === "password" && styles.inputShellFocused,
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="lock-outline"
                        size={24}
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
                        style={[
                          styles.input,
                          {
                            height: metrics.inputHeight,
                          },
                        ]}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField(null)}
                        returnKeyType="done"
                        onSubmitEditing={handleLogin}
                      />
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={
                          showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                        }
                        onPress={() => setShowPassword((current) => !current)}
                        style={({ pressed }) => [
                          styles.trailingIconButton,
                          pressed && styles.pressablePressed,
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={showPassword ? "eye-off-outline" : "eye-outline"}
                          size={24}
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
                      <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
                    </Pressable>
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    onPress={handleLogin}
                    disabled={loading}
                    style={({ pressed }) => [
                      styles.primaryButton,
                      {
                        height: metrics.buttonHeight,
                        borderRadius: metrics.buttonRadius,
                        marginTop: metrics.buttonTopMargin,
                      },
                      loading && styles.primaryButtonDisabled,
                      pressed && !loading && styles.pressablePressed,
                    ]}
                  >
                    <Text style={styles.primaryButtonLabel}>
                      {loading ? "INGRESANDO..." : "INGRESAR"}
                    </Text>
                  </Pressable>
                </Animated.View>
              </View>

              <Animated.View
                style={[styles.footerSection, { marginTop: metrics.footerTopMargin }, footerEntrance]}
              >
                <Svg
                  width="100%"
                  height={metrics.waveHeight}
                  viewBox={`0 0 ${waveWidth} ${metrics.waveHeight}`}
                  preserveAspectRatio="none"
                  style={styles.waveSvg}
                >
                  <Path d={wavePath} fill={SURFACE} />
                </Svg>

                <View
                  style={[
                    styles.footerPanel,
                    {
                      paddingTop: metrics.footerPanelTopPadding,
                      paddingBottom: metrics.footerPanelBottomPadding,
                      paddingHorizontal: metrics.horizontalPadding,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.footerArt,
                      {
                        height: metrics.footerArtHeight,
                        maxWidth: footerArtWidth,
                        marginTop: -metrics.footerArtLift,
                      },
                    ]}
                  >
                    {footerAccentIcons.map((icon, index) => (
                      <MaterialCommunityIcons
                        key={`${icon.name}-${index}`}
                        name={icon.name}
                        size={icon.size}
                        color={DECOR_ORANGE_SOFT}
                        style={[styles.footerAccentIcon, icon.style]}
                      />
                    ))}

                    <View
                      style={[
                        styles.footerFoodIcon,
                        {
                          top: Math.round(metrics.footerArtHeight * 0.14),
                          left: Math.round(footerArtWidth * 0.08),
                        },
                      ]}
                    >
                      <DecorBowlIcon color={DECOR_ORANGE} size={bowlSize} />
                    </View>

                    <View
                      style={[
                        styles.footerFoodIcon,
                        {
                          top: Math.round(metrics.footerArtHeight * 0.24),
                          left: Math.round((footerArtWidth - glassSize) / 2),
                        },
                      ]}
                    >
                      <DecorCupIcon color={DECOR_ORANGE} size={glassSize} />
                    </View>

                    <View
                      style={[
                        styles.footerFoodIcon,
                        {
                          top: Math.round(metrics.footerArtHeight * 0.17),
                          left: Math.round(footerArtWidth * 0.73),
                        },
                      ]}
                    >
                      <DecorLeafIcon color={DECOR_ORANGE} size={leafSize} />
                    </View>
                  </View>

                  <View
                    style={[
                      styles.footerCopy,
                      {
                        marginTop: metrics.footerTextGap,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.footerText,
                        {
                          fontSize: metrics.footerPrimaryFontSize,
                        },
                      ]}
                    >
                      Si necesitas ayuda, contacta a
                    </Text>
                    <Text
                      style={[
                        styles.footerAccent,
                        {
                          fontSize: metrics.footerAccentFontSize,
                        },
                      ]}
                    >
                      Bienestar Universitario.
                    </Text>
                  </View>
                </View>
              </Animated.View>
            </View>
          </ScrollView>
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
  },
  scrollContent: {
    flexGrow: 1,
  },
  screenLayout: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  mainSection: {
    width: "100%",
  },
  logoBlock: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    backgroundColor: "transparent",
  },
  logoImage: {
    alignSelf: "center",
    backgroundColor: "transparent",
  },
  titleBlock: {
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    color: TEXT_PRIMARY,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.2,
  },
  formSection: {
    width: "100%",
    maxWidth: 392,
    alignSelf: "center",
  },
  fieldsGroup: {
    width: "100%",
  },
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
  trailingIconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  optionsRow: {
    marginTop: 14,
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
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: "#D9C6B8",
    backgroundColor: SURFACE,
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
    lineHeight: 20,
  },
  forgotButton: {
    flex: 1,
    paddingVertical: spacing.xs,
  },
  forgotText: {
    color: LINK_ORANGE,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: typography.weights.semiBold,
    textAlign: "right",
  },
  primaryButton: {
    backgroundColor: BUTTON_ORANGE,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: BUTTON_ORANGE,
    shadowOpacity: 0.24,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 7 },
    elevation: 5,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonLabel: {
    color: SURFACE,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.4,
  },
  footerSection: {
    width: "100%",
  },
  waveSvg: {
    width: "100%",
  },
  footerPanel: {
    backgroundColor: SURFACE,
    marginTop: -1,
  },
  footerArt: {
    position: "relative",
    width: "100%",
    alignSelf: "center",
  },
  footerAccentIcon: {
    position: "absolute",
  },
  footerFoodIcon: {
    position: "absolute",
  },
  footerCopy: {
    alignItems: "center",
    alignSelf: "center",
    maxWidth: 292,
  },
  footerText: {
    color: TEXT_MUTED,
    lineHeight: 20,
    textAlign: "center",
  },
  footerAccent: {
    color: ACCENT_ORANGE,
    lineHeight: 22,
    fontWeight: typography.weights.semiBold,
    textAlign: "center",
  },
  pressablePressed: {
    opacity: 0.96,
    transform: [{ scale: 0.985 }],
  },
});
