import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { AppButton, EmptyState, Screen } from "../components";
import { spacing } from "../constants/spacing";
import { useAuth } from "../context/AuthContext";
import { useLocalNotifications } from "../context/LocalNotificationsContext";
import { ROUTES } from "../navigation/routes";
import { StudentStackParamList } from "../navigation/types";
import { getMyReservationById } from "../services/reservationService";
import { designSystem, typography } from "../theme";
import { studentPalette } from "../theme/studentPalette";

type Props = NativeStackScreenProps<
  StudentStackParamList,
  typeof ROUTES.Notifications
>;

export function NotificationsScreen({ navigation }: Props) {
  const { accessToken } = useAuth();
  const { markAllAsRead, markAsRead, notifications, unreadCount } =
    useLocalNotifications();

  const handlePressNotification = async (id: string, reservationId?: string) => {
    markAsRead(id);

    if (!accessToken || !reservationId) {
      return;
    }

    const reservation = await getMyReservationById(accessToken, reservationId);
    if (reservation) {
      navigation.navigate(ROUTES.ReservationTracking, { reservation });
    }
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Notificaciones</Text>
          <Text style={styles.subtitle}>
            {unreadCount ? `${unreadCount} sin leer` : "Todo al día"}
          </Text>
        </View>
        {notifications.length > 0 ? (
          <AppButton
            label="Marcar todas como leídas"
            onPress={markAllAsRead}
            disabled={unreadCount === 0}
            variant="secondary"
            style={styles.headerAction}
          />
        ) : null}
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyVisual}>
            <View style={styles.emptyCircleLarge} />
            <View style={styles.emptyCircleSmall} />
            <MaterialCommunityIcons
              name="bell-outline"
              size={42}
              color={designSystem.colors.primary}
            />
          </View>
          <EmptyState
            title="Sin notificaciones"
            message="Los avisos importantes de tus pedidos aparecerán aquí."
            iconName="bell-outline"
          />
        </View>
      ) : (
        <FlatList
          style={styles.list}
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => (
            <NotificationRow
              index={index}
              item={item}
              onPress={() =>
                void handlePressNotification(item.id, item.reservationId)
              }
            />
          )}
        />
      )}
    </Screen>
  );
}

function NotificationRow({
  item,
  onPress,
}: {
  index: number;
  item: ReturnType<typeof useLocalNotifications>["notifications"][number];
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${item.title}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        !item.read && styles.cardUnread,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons
          name={item.read ? "bell-outline" : "bell-ring-outline"}
          size={designSystem.iconSizes.md}
          color={designSystem.colors.primary}
        />
      </View>
      <View style={styles.textBlock}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          {!item.read ? <View style={styles.unreadDot} /> : null}
        </View>
        {item.message ? (
          <Text style={styles.cardMessage}>{item.message}</Text>
        ) : null}
        <View style={styles.metaRow}>
          <Text style={styles.cardDate}>
            {new Date(item.createdAt).toLocaleString()}
          </Text>
          <Text style={styles.readState}>{item.read ? "Leída" : "Sin leer"}</Text>
        </View>
      </View>
      {item.reservationId ? (
        <MaterialCommunityIcons
          name="chevron-right"
          size={designSystem.iconSizes.md}
          color={designSystem.colors.textMuted}
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: studentPalette.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: designSystem.radii.xl,
    backgroundColor: designSystem.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
    ...designSystem.shadows.low,
  },
  headerText: { flex: 1, minWidth: 0 },
  title: {
    color: designSystem.colors.textPrimary,
    fontSize: typography.roles.screenTitle.fontSize,
    lineHeight: typography.roles.screenTitle.lineHeight,
    fontWeight: typography.roles.screenTitle.fontWeight,
  },
  subtitle: {
    color: designSystem.colors.textSecondary,
    fontSize: typography.sizes.sm,
  },
  headerAction: { maxWidth: 168 },
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: spacing.xxxl,
  },
  emptyVisual: {
    alignSelf: "center",
    width: 118,
    height: 104,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  emptyCircleLarge: {
    position: "absolute",
    width: 104,
    height: 104,
    borderRadius: 999,
    backgroundColor: designSystem.colors.primaryFaint,
  },
  emptyCircleSmall: {
    position: "absolute",
    right: 8,
    bottom: 8,
    width: 46,
    height: 46,
    borderRadius: 999,
    backgroundColor: designSystem.colors.secondarySoft,
  },
  list: { flex: 1, backgroundColor: "transparent" },
  listContent: { gap: spacing.sm, paddingBottom: spacing.xxxl },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: designSystem.radii.xl,
    backgroundColor: designSystem.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: designSystem.colors.border,
    ...designSystem.shadows.low,
  },
  cardUnread: { borderColor: designSystem.colors.primarySoft },
  cardPressed: { backgroundColor: designSystem.colors.surfacePressed },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: designSystem.colors.primaryFaint,
  },
  textBlock: { flex: 1, gap: 3 },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  cardTitle: {
    flex: 1,
    color: designSystem.colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  cardMessage: {
    color: designSystem.colors.textSecondary,
    fontSize: typography.sizes.sm,
    lineHeight: typography.lineHeights.sm,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  cardDate: {
    color: designSystem.colors.textMuted,
    fontSize: typography.sizes.xs,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: designSystem.colors.primary,
  },
  readState: {
    color: designSystem.colors.textMuted,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
});
