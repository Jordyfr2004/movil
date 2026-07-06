import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { spacing } from "../constants/spacing";
import { typography } from "../theme";
import { studentPalette } from "../theme/studentPalette";
import { Restaurant } from "../types/models";

type RestaurantCardProps = {
  restaurant: Restaurant;
  onPress?: (restaurant: Restaurant) => void;
  disabled?: boolean;
};

export function RestaurantCard({
  restaurant,
  onPress,
  disabled = false,
}: RestaurantCardProps) {
  const isDisabled = disabled || !onPress;
  const location = restaurant.location?.trim() || "Campus Manta";
  const openingTime = restaurant.openingTime || "07:00";
  const closingTime = restaurant.closingTime || "15:00";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver restaurante ${restaurant.name}`}
      onPress={onPress ? () => onPress(restaurant) : undefined}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.touchable,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      <View style={styles.card}>
        <View style={styles.imageArea}>
          <View style={styles.fakePhotoBackground}>
            <View style={styles.fakePhotoWall}>
              <Text style={styles.fakePhotoText}>ULEAM</Text>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.table} />
              <View style={styles.table} />
              <View style={styles.table} />
            </View>

            <View style={styles.tableRow}>
              <View style={styles.tableLarge} />
              <View style={styles.tableLarge} />
            </View>
          </View>

          <View style={styles.ratingBadge}>
            <MaterialCommunityIcons
              name="star"
              size={16}
              color={studentPalette.warning}
            />
            <Text style={styles.ratingText}>4.7</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={2}>
            {restaurant.name}
          </Text>

          <View style={styles.locationRow}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={18}
              color={studentPalette.textMuted}
            />
            <Text style={styles.location} numberOfLines={1}>
              {location}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.statusPill}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: restaurant.isActive
                      ? studentPalette.success
                      : studentPalette.danger,
                  },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  {
                    color: restaurant.isActive
                      ? studentPalette.success
                      : studentPalette.danger,
                  },
                ]}
              >
                {restaurant.isActive ? "Abierto" : "Cerrado"}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.timeRow}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={18}
                color={studentPalette.textMuted}
              />
              <Text style={styles.timeText}>
                {openingTime} - {closingTime}
              </Text>
            </View>
          </View>

          <View style={styles.menuNotice}>
            <View style={styles.menuNoticeIcon}>
              <MaterialCommunityIcons
                name="silverware-fork-knife"
                size={16}
                color={studentPalette.primary}
              />
            </View>
            <Text style={styles.menuNoticeText}>
              Menú estudiantil disponible hoy
            </Text>
          </View>

          {!isDisabled ? (
            <View style={styles.actionButton}>
              <Text style={styles.actionText}>Ver menú</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={22}
                color={studentPalette.card}
              />
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  touchable: {
    borderRadius: 24,
  },
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.992 }],
  },
  disabled: {
    opacity: 0.65,
  },
  card: {
    overflow: "hidden",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: studentPalette.border,
    backgroundColor: studentPalette.card,
    shadowColor: studentPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 2,
  },
  imageArea: {
    height: 190,
    margin: spacing.md,
    marginBottom: 0,
    overflow: "hidden",
    borderRadius: 20,
    backgroundColor: studentPalette.primaryPale,
  },
  fakePhotoBackground: {
    flex: 1,
    padding: spacing.md,
    justifyContent: "flex-end",
    backgroundColor: studentPalette.primaryFaint,
  },
  fakePhotoWall: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 92,
    justifyContent: "center",
    paddingLeft: spacing.xl,
    backgroundColor: "#F4E3D1",
  },
  fakePhotoText: {
    color: studentPalette.primary,
    fontSize: 30,
    fontWeight: typography.weights.bold,
    opacity: 0.45,
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  table: {
    flex: 1,
    height: 24,
    borderRadius: 8,
    backgroundColor: "#B57947",
    opacity: 0.7,
  },
  tableLarge: {
    flex: 1,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#8B5A35",
    opacity: 0.72,
  },
  ratingBadge: {
    position: "absolute",
    right: spacing.md,
    top: spacing.md,
    minWidth: 76,
    minHeight: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.xs,
    backgroundColor: studentPalette.card,
    shadowColor: studentPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  ratingText: {
    color: studentPalette.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  name: {
    color: studentPalette.textPrimary,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: typography.weights.bold,
    letterSpacing: -0.3,
    textTransform: "capitalize",
  },
  locationRow: {
    marginTop: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  location: {
    flex: 1,
    color: studentPalette.textSecondary,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.md,
  },
  metaRow: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flexWrap: "wrap",
  },
  statusPill: {
    minHeight: 32,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: studentPalette.successSoft,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
  },
  statusText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  divider: {
    width: 1,
    height: 22,
    backgroundColor: studentPalette.borderStrong,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  timeText: {
    color: studentPalette.textSecondary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semiBold,
  },
  menuNotice: {
    marginTop: spacing.md,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: studentPalette.border,
    backgroundColor: studentPalette.primaryFaint,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  menuNoticeIcon: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: studentPalette.primaryPale,
  },
  menuNoticeText: {
    flex: 1,
    color: studentPalette.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semiBold,
  },
  actionButton: {
    marginTop: spacing.md,
    minHeight: 58,
    borderRadius: 16,
    backgroundColor: studentPalette.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    shadowColor: studentPalette.primary,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  actionText: {
    color: studentPalette.card,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
});