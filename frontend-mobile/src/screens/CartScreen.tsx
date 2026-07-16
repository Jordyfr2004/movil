import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import {
  AppButton,
  EmptyState,
  QuantityStepper,
  Screen,
} from "../components";
import { spacing } from "../constants/spacing";
import { CartItem, RemovedCartItem, useCart } from "../context/CartContext";
import { useReduceMotion } from "../hooks/useReduceMotion";
import { ROUTES } from "../navigation/routes";
import { StudentStackParamList } from "../navigation/types";
import { designSystem, typography } from "../theme";
import { studentPalette } from "../theme/studentPalette";

type Props = NativeStackScreenProps<StudentStackParamList, typeof ROUTES.Cart>;

const UNDO_TIMEOUT_MS = 5000;

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`;
}

export function CartScreen({ navigation }: Props) {
  const {
    clearCart,
    itemCount,
    items,
    removeItem,
    restoreItem,
    restaurant,
    subtotal,
    total,
    updateNotes,
    updateQuantity,
  } = useCart();
  const [pendingRemoval, setPendingRemoval] =
    useState<RemovedCartItem | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }
    };
  }, []);

  const clearPendingRemoval = () => {
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }

    setPendingRemoval(null);
  };

  const handleRemove = (key: string) => {
    clearPendingRemoval();

    const removed = removeItem(key);

    if (!removed) {
      return;
    }

    setPendingRemoval(removed);
    undoTimerRef.current = setTimeout(() => {
      setPendingRemoval(null);
      undoTimerRef.current = null;
    }, UNDO_TIMEOUT_MS);
  };

  const handleUndoRemove = () => {
    if (!pendingRemoval) {
      return;
    }

    restoreItem(pendingRemoval);
    clearPendingRemoval();
  };

  const handleContinue = () => {
    Alert.alert(
      "Pedido preparado",
      "El carrito queda listo para el siguiente bloque. Aún no se crea el pedido ni se inicia pago."
    );
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Carrito</Text>
          {restaurant ? (
            <Text style={styles.subtitle}>{restaurant.name}</Text>
          ) : null}
        </View>
        {items.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Vaciar carrito"
            onPress={() => {
              clearPendingRemoval();
              clearCart();
            }}
            style={({ pressed }) => [
              styles.clearButton,
              pressed && styles.clearPressed,
            ]}
          >
            <Text style={styles.clearText}>Vaciar</Text>
          </Pressable>
        ) : null}
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            title="Tu carrito está vacío"
            message="Agrega platos desde un restaurante para continuar."
            iconName="cart-outline"
            actionLabel="Volver a explorar"
            onActionPress={() => navigation.navigate(ROUTES.Home)}
          />
          {pendingRemoval ? (
            <View style={styles.undoBar}>
              <Text style={styles.undoText} numberOfLines={1}>
                Producto eliminado
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Deshacer eliminación"
                onPress={handleUndoRemove}
              >
                <Text style={styles.undoAction}>Deshacer</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      ) : (
        <>
          <FlatList
            style={styles.list}
            data={items}
            keyExtractor={(item) => item.key}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item, index }) => (
              <CartItemCard
                index={index}
                item={item}
                onRemove={handleRemove}
                onUpdateNotes={updateNotes}
                onUpdateQuantity={updateQuantity}
              />
            )}
          />

          {pendingRemoval ? (
            <View style={styles.undoBar}>
              <Text style={styles.undoText} numberOfLines={1}>
                Producto eliminado
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Deshacer eliminación"
                onPress={handleUndoRemove}
              >
                <Text style={styles.undoAction}>Deshacer</Text>
              </Pressable>
            </View>
          ) : null}

          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Subtotal · {itemCount} {itemCount === 1 ? "producto" : "productos"}
              </Text>
              <Text style={styles.summaryValue}>{formatMoney(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatMoney(total)}</Text>
            </View>
            <AppButton label="Continuar" onPress={handleContinue} />
          </View>
        </>
      )}
    </Screen>
  );
}

function CartItemCard({
  index,
  item,
  onRemove,
  onUpdateNotes,
  onUpdateQuantity,
}: {
  index: number;
  item: CartItem;
  onRemove: (key: string) => void;
  onUpdateNotes: (key: string, notes: string) => void;
  onUpdateQuantity: (key: string, quantity: number) => void;
}) {
  const reduceMotion = useReduceMotion();
  const opacity = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(reduceMotion ? 0 : 10)).current;

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
        delay: Math.min(index * 45, 180),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: designSystem.animation.normal,
        delay: Math.min(index * 45, 180),
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, opacity, reduceMotion, translateY]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <View style={styles.itemCard}>
        <View style={styles.itemTop}>
          <View style={styles.itemImage}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
            ) : (
              <MaterialCommunityIcons
                name="food-outline"
                size={designSystem.iconSizes.lg}
                color={designSystem.colors.primary}
              />
            )}
          </View>

          <View style={styles.itemText}>
            <Text style={styles.itemName} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.itemPrice}>{formatMoney(item.price)}</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Eliminar ${item.name}`}
            onPress={() => onRemove(item.key)}
            hitSlop={8}
            style={({ pressed }) => [styles.remove, pressed && styles.removePressed]}
          >
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={designSystem.iconSizes.sm}
              color={designSystem.colors.danger}
            />
          </Pressable>
        </View>

        <View style={styles.quantityRow}>
          <QuantityStepper
            value={item.quantity}
            onChange={(quantity) => onUpdateQuantity(item.key, quantity)}
          />
          <Text style={styles.lineTotal}>
            {formatMoney(item.price * item.quantity)}
          </Text>
        </View>

        <TextInput
          value={item.notes}
          onChangeText={(text) => onUpdateNotes(item.key, text)}
          placeholder="Observación para cocina"
          placeholderTextColor={designSystem.colors.textMuted}
          style={styles.notes}
          maxLength={140}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: studentPalette.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.xl,
    lineHeight: typography.lineHeights.xl,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    color: designSystem.colors.textSecondary,
    fontSize: typography.sizes.sm,
  },
  clearButton: {
    minHeight: 34,
    borderRadius: designSystem.radii.pill,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: designSystem.colors.dangerSoft,
  },
  clearPressed: {
    transform: [{ scale: 0.96 }],
  },
  clearText: {
    color: designSystem.colors.danger,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  list: {
    flex: 1,
    backgroundColor: "transparent",
  },
  listContent: {
    gap: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
  },
  itemCard: {
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 18,
    backgroundColor: designSystem.colors.surface,
    borderWidth: 1,
    borderColor: "rgba(240, 223, 201, 0.72)",
    ...designSystem.shadows.sm,
  },
  itemTop: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center",
  },
  itemImage: {
    width: 58,
    height: 58,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: designSystem.colors.primaryFaint,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  itemText: {
    flex: 1,
    minWidth: 0,
  },
  itemName: {
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
    fontWeight: typography.weights.bold,
  },
  itemPrice: {
    marginTop: spacing.xs,
    color: designSystem.colors.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  remove: {
    width: 34,
    height: 34,
    borderRadius: designSystem.radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: designSystem.colors.dangerSoft,
  },
  removePressed: {
    transform: [{ scale: 0.94 }],
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  lineTotal: {
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  notes: {
    minHeight: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
    backgroundColor: designSystem.colors.surface,
    paddingHorizontal: spacing.md,
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.sm,
  },
  undoBar: {
    marginTop: spacing.sm,
    minHeight: 42,
    borderRadius: designSystem.radii.pill,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: designSystem.colors.textPrimary,
  },
  undoText: {
    flex: 1,
    color: designSystem.colors.textInverted,
    fontSize: typography.sizes.sm,
  },
  undoAction: {
    color: designSystem.colors.primarySoft,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  summary: {
    gap: spacing.sm,
    paddingTop: spacing.md,
    backgroundColor: studentPalette.background,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryLabel: {
    color: designSystem.colors.textSecondary,
    fontSize: typography.sizes.sm,
  },
  summaryValue: {
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  totalLabel: {
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  totalValue: {
    color: designSystem.colors.primary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
});
