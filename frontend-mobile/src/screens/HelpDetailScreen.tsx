import React, { useEffect, useRef } from "react";
import { Animated, ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { AppButton, Screen } from "../components";
import { spacing } from "../constants/spacing";
import { useReduceMotion } from "../hooks/useReduceMotion";
import { ROUTES } from "../navigation/routes";
import { StudentStackParamList } from "../navigation/types";
import { designSystem, typography } from "../theme";
import { studentPalette } from "../theme/studentPalette";

type Props = NativeStackScreenProps<StudentStackParamList, typeof ROUTES.HelpDetail>;

export const HELP_TOPICS = {
  cart: {
    icon: "cart-outline" as const,
    title: "Carrito",
    explanation: "Tu carrito conserva los platos que elegiste para completar el pedido cuando estés listo.",
    steps: ["Explora restaurantes", "Toca un plato", "Ajusta cantidad y observaciones"],
    errors: ["El plato puede dejar de estar disponible", "No se pueden mezclar restaurantes"],
    action: "Ir a explorar",
  },
  access: {
    icon: "account-key-outline" as const,
    title: "Sesión y acceso",
    explanation: "Si tu sesión expira, vuelve a iniciar sesión. Tu carrito local se conserva.",
    steps: ["Abre la app", "Inicia sesión", "Continúa donde lo dejaste"],
    errors: ["Correo o contraseña incorrectos", "Sesión expirada"],
    action: "Volver",
  },
  payments: {
    icon: "credit-card-outline" as const,
    title: "Pagos",
    explanation: "El pago se confirma con el estado real de tu reserva.",
    steps: ["Revisa el resumen", "Completa el pago", "Espera la confirmación"],
    errors: ["Pago cancelado", "Confirmación pendiente", "Conexión inestable"],
    action: "Ver mis reservas",
  },
  reservations: {
    icon: "receipt-text-outline" as const,
    title: "Reservas",
    explanation: "Mis reservas muestra el historial y el seguimiento de tus pedidos.",
    steps: ["Abre Pedidos", "Toca una reserva", "Actualiza el estado si lo necesitas"],
    errors: ["Reserva cancelada", "Pago pendiente", "Producto no disponible"],
    action: "Ver mis reservas",
  },
  qr: {
    icon: "qrcode-scan" as const,
    title: "Retiro por QR",
    explanation: "El QR permite retirar de forma segura una reserva confirmada.",
    steps: ["Abre una reserva confirmada", "Genera el QR", "Muéstralo al manager"],
    errors: ["QR expirado", "QR utilizado", "Reserva no confirmada"],
    action: "Ver reservas confirmadas",
  },
};

export type HelpTopicKey = keyof typeof HELP_TOPICS;

export function HelpDetailScreen({ navigation, route }: Props) {
  const topic = HELP_TOPICS[route.params.topic];
  const reduceMotion = useReduceMotion();
  const opacity = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;

  useEffect(() => {
    if (reduceMotion) return;
    Animated.timing(opacity, {
      toValue: 1,
      duration: designSystem.animation.normal,
      useNativeDriver: true,
    }).start();
  }, [opacity, reduceMotion]);

  const handleAction = () => {
    if (route.params.topic === "cart") {
      navigation.navigate(ROUTES.Home);
      return;
    }
    if (
      route.params.topic === "payments" ||
      route.params.topic === "reservations" ||
      route.params.topic === "qr"
    ) {
      navigation.navigate(ROUTES.MyReservations);
      return;
    }
    navigation.goBack();
  };

  return (
    <Screen style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Animated.View style={[styles.hero, { opacity }]}>
          <View style={styles.icon}>
            <MaterialCommunityIcons
              name={topic.icon}
              size={40}
              color={designSystem.colors.primary}
            />
          </View>
          <Text style={styles.title}>{topic.title}</Text>
          <Text style={styles.explanation}>{topic.explanation}</Text>
        </Animated.View>

        <InfoSection title="Pasos" items={topic.steps} />
        <InfoSection title="Errores frecuentes" items={topic.errors} />
        <AppButton label={topic.action} onPress={handleAction} />
      </ScrollView>
    </Screen>
  );
}

function InfoSection({ title, items }: { title: string; items: string[] }) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item) => (
        <View key={item} style={styles.row}>
          <View style={styles.bullet} />
          <Text style={styles.rowText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: studentPalette.background },
  scroll: { flex: 1, backgroundColor: "transparent" },
  content: { gap: spacing.md, paddingBottom: spacing.xxxl },
  hero: {
    alignItems: "center",
    padding: spacing.lg,
    borderRadius: 22,
    backgroundColor: designSystem.colors.surface,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
    ...designSystem.shadows.sm,
  },
  icon: {
    width: 82,
    height: 82,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: designSystem.colors.primaryFaint,
  },
  title: {
    marginTop: spacing.md,
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  explanation: {
    marginTop: spacing.sm,
    color: designSystem.colors.textSecondary,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    textAlign: "center",
  },
  card: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 18,
    backgroundColor: designSystem.colors.surface,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
  },
  sectionTitle: {
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  bullet: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: designSystem.colors.primary,
  },
  rowText: {
    flex: 1,
    color: designSystem.colors.textSecondary,
    fontSize: typography.sizes.sm,
  },
});
