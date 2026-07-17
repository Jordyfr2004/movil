import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppButton, QuantityStepper, Screen } from "../components";
import { spacing } from "../constants/spacing";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { useReduceMotion } from "../hooks/useReduceMotion";
import { ROUTES } from "../navigation/routes";
import { StudentStackParamList } from "../navigation/types";
import { designSystem, typography } from "../theme";
import { studentPalette } from "../theme/studentPalette";

type Props = NativeStackScreenProps<
  StudentStackParamList,
  typeof ROUTES.FoodDetail
>;

const NOTES_LIMIT = 140;

function formatMoney(value: string) {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? `$${parsed.toFixed(2)}` : `$${value}`;
}

export function FoodDetailScreen({ navigation, route }: Props) {
  const { dish, restaurant } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const { addDish } = useCart();
  const { isDishFavorite, toggleDish } = useFavorites();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();
  const opacity = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(reduceMotion ? 0 : 14)).current;

  const isAvailable = dish.isActive && dish.isAvailable;
  const favorite = isDishFavorite(dish.id);

  const subtotal = useMemo(() => {
    const price = Number(dish.price.replace(",", "."));
    return Number.isFinite(price) ? price * quantity : 0;
  }, [dish.price, quantity]);

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: designSystem.animation.normal,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: designSystem.animation.normal,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, reduceMotion, translateY]);

  const confirmReplaceCart = () => {
    Alert.alert(
      "Cambiar restaurante",
      "Tu carrito tiene productos de otro restaurante.",
      [
        { text: "Mantener carrito", style: "default" },
        {
          text: "Vaciar carrito y continuar",
          style: "destructive",
          onPress: () => {
            addDish(restaurant, dish, quantity, notes, true);
            navigation.goBack();
          },
        },
        { text: "Cancelar", style: "cancel" },
      ]
    );
  };

  const handleAddToCart = () => {
    const result = addDish(restaurant, dish, quantity, notes);
    if (result.status === "restaurant-conflict") {
      confirmReplaceCart();
      return;
    }

    navigation.goBack();
  };

  return (
    <Screen style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: 124 + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={{
              opacity,
              transform: [{ translateY }],
            }}
          >
            <View style={styles.media}>
              {dish.imageUrl ? (
                <Image source={{ uri: dish.imageUrl }} style={styles.image} />
              ) : (
                <View style={styles.placeholder}>
                  <View style={styles.placeholderGlow} />
                  <MaterialCommunityIcons
                    name="food-variant"
                    size={44}
                    color={studentPalette.primary}
                  />
                </View>
              )}
              <View style={styles.mediaActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Volver"
                  onPress={() => navigation.goBack()}
                  style={styles.mediaActionButton}
                >
                  <MaterialCommunityIcons
                    name="chevron-left"
                    size={designSystem.iconSizes.md}
                    color={designSystem.colors.textPrimary}
                  />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    favorite ? "Quitar plato favorito" : "Guardar plato favorito"
                  }
                  onPress={() => toggleDish(restaurant, dish)}
                  style={styles.mediaActionButton}
                >
                  <MaterialCommunityIcons
                    name={favorite ? "heart" : "heart-outline"}
                    size={designSystem.iconSizes.md}
                    color={designSystem.colors.primary}
                  />
                </Pressable>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.titleRow}>
                <View style={styles.titleText}>
                  <Text style={styles.restaurantName} numberOfLines={1}>
                    {restaurant.name}
                  </Text>
                  <Text style={styles.name}>{dish.name}</Text>
                </View>
                <Text style={styles.price}>{formatMoney(dish.price)}</Text>
              </View>

              {dish.description ? (
                <Text style={styles.description}>{dish.description}</Text>
              ) : null}

              <View style={styles.metaRow}>
                <View
                  style={[
                    styles.status,
                    isAvailable ? styles.statusSuccess : styles.statusMuted,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      isAvailable
                        ? styles.statusSuccessText
                        : styles.statusMutedText,
                    ]}
                  >
                    {isAvailable ? "Disponible" : "No disponible"}
                  </Text>
                </View>
                {dish.category ? (
                  <View style={styles.status}>
                    <Text style={styles.statusMutedText}>{dish.category}</Text>
                  </View>
                ) : null}
              </View>

              {dish.ingredients?.length ? (
                <View style={styles.infoBlock}>
                  <Text style={styles.infoTitle}>Ingredientes</Text>
                  <Text style={styles.infoText}>
                    {dish.ingredients.join(", ")}
                  </Text>
                </View>
              ) : null}

              {dish.additionalInfo ? (
                <View style={styles.infoBlock}>
                  <Text style={styles.infoTitle}>Información adicional</Text>
                  <Text style={styles.infoText}>{dish.additionalInfo}</Text>
                </View>
              ) : null}

              <View style={styles.quantityRow}>
                <Text style={styles.sectionLabel}>Cantidad</Text>
                <QuantityStepper
                  value={quantity}
                  onChange={setQuantity}
                  disabled={!isAvailable}
                />
              </View>

              <View style={styles.notesBlock}>
                <View style={styles.notesHeader}>
                  <Text style={styles.sectionLabel}>Observaciones</Text>
                  <Text style={styles.counter}>
                    {notes.length}/{NOTES_LIMIT}
                  </Text>
                </View>
                <TextInput
                  value={notes}
                  onChangeText={(text) => setNotes(text.slice(0, NOTES_LIMIT))}
                  placeholder="Ej. Sin cebolla, poca salsa..."
                  placeholderTextColor={designSystem.colors.textMuted}
                  multiline
                  maxLength={NOTES_LIMIT}
                  style={styles.notesInput}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: spacing.md + insets.bottom }]}>
          <AppButton
            label={`Agregar al carrito · $${subtotal.toFixed(2)}`}
            onPress={handleAddToCart}
            disabled={!isAvailable}
            style={styles.addButton}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: studentPalette.background,
  },
  keyboard: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    gap: spacing.md,
  },
  media: {
    height: 260,
    borderRadius: designSystem.radii.xl,
    overflow: "hidden",
    backgroundColor: studentPalette.cardMuted,
    borderWidth: 1,
    borderColor: studentPalette.border,
    ...designSystem.shadows.medium,
  },
  mediaActions: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  mediaActionButton: {
    width: 40,
    height: 40,
    borderRadius: designSystem.radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 253, 249, 0.92)",
    borderWidth: 1,
    borderColor: "rgba(236, 217, 197, 0.68)",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  placeholderGlow: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 999,
    right: -80,
    top: -80,
    backgroundColor: studentPalette.primarySoft,
    opacity: 0.52,
  },
  card: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: designSystem.radii.xl,
    backgroundColor: studentPalette.cardElevated,
    borderWidth: 1,
    borderColor: studentPalette.border,
    ...designSystem.shadows.low,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  titleText: {
    flex: 1,
    minWidth: 0,
  },
  restaurantName: {
    color: designSystem.colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  name: {
    marginTop: spacing.xs,
    color: designSystem.colors.textPrimary,
    fontSize: typography.roles.heroTitle.fontSize,
    lineHeight: typography.roles.heroTitle.lineHeight,
    fontWeight: typography.roles.heroTitle.fontWeight,
  },
  price: {
    color: designSystem.colors.primary,
    fontSize: typography.roles.price.fontSize,
    lineHeight: typography.roles.price.lineHeight,
    fontWeight: typography.roles.price.fontWeight,
  },
  description: {
    color: designSystem.colors.textSecondary,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  status: {
    minHeight: 30,
    borderRadius: designSystem.radii.pill,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: designSystem.colors.neutralSoft,
  },
  statusSuccess: {
    backgroundColor: designSystem.colors.successSoft,
  },
  statusMuted: {
    backgroundColor: designSystem.colors.neutralSoft,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  statusSuccessText: {
    color: designSystem.colors.success,
  },
  statusMutedText: {
    color: designSystem.colors.neutral,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  infoBlock: {
    gap: spacing.xs,
  },
  infoTitle: {
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  infoText: {
    color: designSystem.colors.textSecondary,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  sectionLabel: {
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  notesBlock: {
    gap: spacing.sm,
  },
  notesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  counter: {
    color: designSystem.colors.textMuted,
    fontSize: typography.sizes.xs,
  },
  notesInput: {
    minHeight: 92,
    borderRadius: designSystem.radii.input,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
    backgroundColor: designSystem.colors.surfaceElevated,
    padding: spacing.md,
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: studentPalette.background,
    borderTopWidth: 1,
    borderTopColor: designSystem.colors.divider,
  },
  addButton: {
    width: "100%",
  },
});
