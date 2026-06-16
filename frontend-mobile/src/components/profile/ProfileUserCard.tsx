import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";

import { spacing } from "../../constants/spacing";
import { typography } from "../../theme";
import { studentPalette } from "../../theme/studentPalette";
import { Card } from "../Card";
import { StudentStatusPill } from "../StudentStatusPill";
import { StudentVisualPlaceholder } from "../StudentVisualPlaceholder";

type ProfileUserCardProps = {
  displayEmail: string;
  displayName: string;
  initial: string;
  isLoggingOut: boolean;
  roleLabel: string;
  onLogout: () => void;
  onOpenReservations: () => void;
};

export function ProfileUserCard({
  displayEmail,
  displayName,
  initial,
  isLoggingOut,
  roleLabel,
  onLogout,
  onOpenReservations,
}: ProfileUserCardProps) {
  return (
    <>
      <Card style={styles.card}>
        <View
          style={styles.decor}
          pointerEvents="none"
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Svg
            width="100%"
            height={58}
            viewBox="0 0 360 58"
            preserveAspectRatio="none"
            style={styles.decorWave}
          >
            <Path
              d="M0 34 C72 16 139 52 217 36 C284 22 326 18 360 28 V58 H0 Z"
              fill={studentPalette.primaryPale}
            />
          </Svg>
          <View style={styles.decorCircle} />
        </View>

        <View style={styles.profileRow}>
          <StudentVisualPlaceholder
            initial={initial}
            label={`Avatar de ${displayName}`}
            size="md"
            style={styles.avatar}
            variant="profile"
          />

          <View style={styles.profileText}>
            <Text style={styles.name} numberOfLines={2}>
              {displayName}
            </Text>
            {displayEmail ? (
              <Text style={styles.email} numberOfLines={1}>
                {displayEmail}
              </Text>
            ) : null}
            <StudentStatusPill
              iconName="school-outline"
              label={roleLabel}
              tone="primary"
            />
          </View>
        </View>

        <View style={styles.infoCard}>
          <ProfileField
            iconName="email-outline"
            label="Correo"
            value={displayEmail || "No disponible"}
          />
          <View style={styles.divider} />
          <ProfileField
            iconName="card-account-details-outline"
            label="Rol"
            value={roleLabel}
          />
        </View>
      </Card>

      <Card style={styles.actionsCard}>
        <ProfileActionRow
          iconName="calendar-check-outline"
          label="Mis reservas"
          onPress={onOpenReservations}
        />
        <View style={styles.divider} />
        <ProfileActionRow
          disabled={isLoggingOut}
          iconName="logout-variant"
          label={isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
          onPress={onLogout}
          tone="danger"
        />
      </Card>
    </>
  );
}

function ProfileField({
  iconName,
  label,
  value,
}: {
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldIcon}>
        <MaterialCommunityIcons
          name={iconName}
          size={18}
          color={studentPalette.primary}
        />
      </View>
      <View style={styles.fieldText}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function ProfileActionRow({
  disabled,
  iconName,
  label,
  onPress,
  tone = "default",
}: {
  disabled?: boolean;
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  onPress: () => void;
  tone?: "default" | "danger";
}) {
  const isDanger = tone === "danger";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionRow,
        pressed && !disabled && styles.actionPressed,
        disabled && styles.actionDisabled,
      ]}
    >
      <View style={[styles.actionIcon, isDanger && styles.actionIconDanger]}>
        <MaterialCommunityIcons
          name={iconName}
          size={20}
          color={isDanger ? studentPalette.primary : studentPalette.primary}
        />
      </View>
      <Text style={[styles.actionLabel, isDanger && styles.actionLabelDanger]}>
        {label}
      </Text>
      <MaterialCommunityIcons
        name="chevron-right"
        size={21}
        color={studentPalette.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "relative",
    borderRadius: 22,
    borderColor: studentPalette.border,
    backgroundColor: studentPalette.cardMuted,
    shadowColor: studentPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
    overflow: "hidden",
  },
  decor: {
    ...StyleSheet.absoluteFillObject,
  },
  decorWave: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
  },
  decorCircle: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 999,
    right: -34,
    top: -28,
    backgroundColor: "rgba(247, 101, 2, 0.07)",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 999,
  },
  profileText: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  name: {
    fontSize: 22,
    fontWeight: typography.weights.bold,
    color: studentPalette.textPrimary,
    lineHeight: 28,
  },
  email: {
    fontSize: typography.sizes.sm,
    color: studentPalette.textSecondary,
    lineHeight: typography.lineHeights.sm,
  },
  infoCard: {
    marginTop: spacing.md,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: studentPalette.border,
    backgroundColor: studentPalette.card,
    overflow: "hidden",
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.sm,
  },
  fieldIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: studentPalette.primaryPale,
  },
  fieldText: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: typography.sizes.xs,
    color: studentPalette.textMuted,
    lineHeight: typography.lineHeights.xs,
  },
  value: {
    marginTop: 1,
    fontSize: typography.sizes.md,
    color: studentPalette.textPrimary,
    fontWeight: typography.weights.semiBold,
    lineHeight: typography.lineHeights.md,
  },
  actionsCard: {
    marginTop: spacing.md,
    padding: 0,
    borderRadius: 20,
    borderColor: studentPalette.border,
    backgroundColor: studentPalette.card,
    shadowColor: studentPalette.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 1,
    overflow: "hidden",
  },
  actionRow: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  actionPressed: {
    backgroundColor: studentPalette.primaryFaint,
  },
  actionDisabled: {
    opacity: 0.65,
  },
  actionIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: studentPalette.primaryPale,
  },
  actionIconDanger: {
    backgroundColor: studentPalette.primaryPale,
  },
  actionLabel: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: studentPalette.textPrimary,
    fontWeight: typography.weights.semiBold,
    lineHeight: typography.lineHeights.md,
  },
  actionLabelDanger: {
    color: studentPalette.primary,
  },
  divider: {
    height: 1,
    backgroundColor: studentPalette.border,
  },
});
