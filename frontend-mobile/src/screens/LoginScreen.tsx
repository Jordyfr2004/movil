import React, { useLayoutEffect, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  LoginFooter,
  LoginForm,
  LoginHeader,
  SCREEN_BACKGROUND,
  TEXT_PRIMARY,
  getLoginLayoutMetrics,
} from "../components/login";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../navigation/routes";
import { RootStackParamList } from "../navigation/types";
import { classifyAuthError } from "../services/authServices";
import { typography } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.Login>;

export function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const metrics = getLoginLayoutMetrics(width, height, insets.bottom);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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

  const logLoginDebug = (
    message: string,
    details?: Record<string, unknown>
  ) => {
    if (!__DEV__) {
      return;
    }

    if (details) {
      console.log(`[login-screen] ${message}`, details);
      return;
    }

    console.log(`[login-screen] ${message}`);
  };

  const handleRegister = () => {
    navigation.navigate(ROUTES.Register);
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

      await login({
        email: normalizedEmail,
        password: normalizedPassword,
      });

      Alert.alert("Éxito", "Inicio de sesión correcto");
    } catch (error: unknown) {
      const errorKind = classifyAuthError(error);
      const errorMessage =
        error instanceof Error ? error.message : "Error al iniciar sesión";

      logLoginDebug("El error de login llegó a la pantalla", {
        kind: errorKind,
        message: errorMessage,
      });

      const message =
        errorKind === "timeout" || errorKind === "red"
          ? "No pudimos conectar. Revisa tu conexión e inténtalo nuevamente."
          : errorMessage;

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
                <LoginHeader metrics={metrics} />
                <LoginForm
                  email={email}
                  password={password}
                  loading={loading}
                  metrics={metrics}
                  onEmailChange={setEmail}
                  onPasswordChange={setPassword}
                  onForgotPassword={handleForgotPassword}
                  onRegister={handleRegister}
                  onSubmit={handleLogin}
                />
              </View>

              <LoginFooter metrics={metrics} screenWidth={width} />
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
});
