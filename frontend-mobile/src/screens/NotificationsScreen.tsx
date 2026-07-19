import React, {
  useCallback,
  useState,
} from "react";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  useFocusEffect,
} from "@react-navigation/native";
import {
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import {
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import {
  AppButton,
  EmptyState,
  ErrorMessage,
  LoadingState,
  Screen,
} from "../components";
import { spacing } from "../constants/spacing";
import { useAuth } from "../context/AuthContext";
import {
  useLocalNotifications,
} from "../context/LocalNotificationsContext";
import { ROUTES } from "../navigation/routes";
import {
  StudentStackParamList,
} from "../navigation/types";
import {
  getMyReservationById,
} from "../services/reservationService";
import {
  designSystem,
  typography,
} from "../theme";
import {
  studentPalette,
} from "../theme/studentPalette";

type Props = NativeStackScreenProps<
  StudentStackParamList,
  typeof ROUTES.Notifications
>;

type NotificationItem =
  ReturnType<
    typeof useLocalNotifications
  >["notifications"][number];

function readErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (
    error instanceof Error &&
    error.message.trim()
  ) {
    return error.message;
  }

  return fallback;
}

function formatNotificationDate(
  value: string
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString();
}

export function NotificationsScreen({
  navigation,
}: Props) {
  const { accessToken } = useAuth();

  const {
    isHydrated,
    isRefreshing,
    markAllAsRead,
    markAsRead,
    notifications,
    refreshNotifications,
    unreadCount,
  } = useLocalNotifications();

  const [
    loadError,
    setLoadError,
  ] = useState<string | null>(null);

  const [
    isMarkingAll,
    setIsMarkingAll,
  ] = useState(false);

  const [
    openingNotificationId,
    setOpeningNotificationId,
  ] = useState<string | null>(null);

  const loadNotifications =
    useCallback(async () => {
      if (!accessToken) {
        return;
      }

      try {
        setLoadError(null);

        await refreshNotifications(
          accessToken
        );
      } catch (error: unknown) {
        setLoadError(
          readErrorMessage(
            error,
            "No se pudieron cargar las notificaciones."
          )
        );
      }
    }, [
      accessToken,
      refreshNotifications,
    ]);

  useFocusEffect(
    useCallback(() => {
      void loadNotifications();
    }, [loadNotifications])
  );

  const handleMarkAllAsRead =
    useCallback(async () => {
      if (
        isMarkingAll ||
        unreadCount === 0
      ) {
        return;
      }

      try {
        setIsMarkingAll(true);

        await markAllAsRead(
          accessToken
        );
      } finally {
        setIsMarkingAll(false);
      }
    }, [
      accessToken,
      isMarkingAll,
      markAllAsRead,
      unreadCount,
    ]);

  const handlePressNotification =
    useCallback(
      async (
        notification: NotificationItem
      ) => {
        if (openingNotificationId) {
          return;
        }

        setOpeningNotificationId(
          notification.id
        );

        try {
          try {
            await markAsRead(
              notification.id,
              accessToken
            );
          } catch {
            Alert.alert(
              "No se pudo actualizar",
              "La notificación no pudo marcarse como leída en el servidor."
            );
          }

          if (
            !accessToken ||
            !notification.reservationId
          ) {
            return;
          }

          const reservation =
            await getMyReservationById(
              accessToken,
              notification.reservationId
            );

          if (!reservation) {
            Alert.alert(
              "Reserva no disponible",
              "No se pudo encontrar la reserva relacionada."
            );
            return;
          }

          navigation.navigate(
            ROUTES.ReservationTracking,
            {
              reservation,
            }
          );
        } catch (error: unknown) {
          Alert.alert(
            "No se pudo abrir la reserva",
            readErrorMessage(
              error,
              "No pudimos consultar la reserva relacionada."
            )
          );
        } finally {
          setOpeningNotificationId(
            null
          );
        }
      },
      [
        accessToken,
        markAsRead,
        navigation,
        openingNotificationId,
      ]
    );

  const isInitialLoading =
    !isHydrated ||
    (
      isRefreshing &&
      notifications.length === 0
    );

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>
            Notificaciones
          </Text>

          <Text style={styles.subtitle}>
            {unreadCount > 0
              ? `${unreadCount} sin leer`
              : "Todo al día"}
          </Text>
        </View>

        {notifications.length > 0 ? (
          <AppButton
            label={
              isMarkingAll
                ? "Marcando..."
                : "Marcar todas como leídas"
            }
            onPress={() => {
              void handleMarkAllAsRead();
            }}
            disabled={
              unreadCount === 0 ||
              isMarkingAll
            }
            variant="secondary"
            style={styles.headerAction}
          />
        ) : null}
      </View>

      {isInitialLoading ? (
        <LoadingState
          message="Cargando notificaciones..."
          style={styles.feedback}
        />
      ) : loadError &&
        notifications.length === 0 ? (
        <ErrorMessage
          title="No se pudieron cargar"
          message={loadError}
          onRetry={() => {
            void loadNotifications();
          }}
          style={styles.feedback}
        />
      ) : notifications.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyVisual}>
            <View
              style={styles.emptyCircleLarge}
            />

            <View
              style={styles.emptyCircleSmall}
            />

            <MaterialCommunityIcons
              name="bell-outline"
              size={42}
              color={
                designSystem.colors.primary
              }
            />
          </View>

          <EmptyState
            title="Sin notificaciones"
            message="Los avisos importantes de tus pedidos aparecerán aquí."
            iconName="bell-outline"
          />

          <AppButton
            label={
              isRefreshing
                ? "Actualizando..."
                : "Actualizar"
            }
            onPress={() => {
              void loadNotifications();
            }}
            disabled={isRefreshing}
            variant="secondary"
            style={styles.refreshButton}
          />
        </View>
      ) : (
        <>
          {loadError ? (
            <ErrorMessage
              title="No se pudo actualizar"
              message={loadError}
              onRetry={() => {
                void loadNotifications();
              }}
              style={styles.listError}
            />
          ) : null}

          <FlatList
            style={styles.list}
            data={notifications}
            keyExtractor={(item) =>
              item.id
            }
            contentContainerStyle={
              styles.listContent
            }
            showsVerticalScrollIndicator={
              false
            }
            refreshControl={
              <RefreshControl
                refreshing={
                  isRefreshing
                }
                onRefresh={() => {
                  void loadNotifications();
                }}
                tintColor={
                  designSystem.colors.primary
                }
                colors={[
                  designSystem.colors.primary,
                ]}
              />
            }
            renderItem={({ item }) => (
              <NotificationRow
                item={item}
                disabled={
                  openingNotificationId !==
                  null
                }
                isOpening={
                  openingNotificationId ===
                  item.id
                }
                onPress={() => {
                  void handlePressNotification(
                    item
                  );
                }}
              />
            )}
          />
        </>
      )}
    </Screen>
  );
}

function NotificationRow({
  item,
  disabled,
  isOpening,
  onPress,
}: {
  item: NotificationItem;
  disabled: boolean;
  isOpening: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir ${item.title}`}
      accessibilityState={{
        disabled,
      }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        !item.read &&
          styles.cardUnread,
        pressed &&
          styles.cardPressed,
        disabled &&
          styles.cardDisabled,
      ]}
    >
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons
          name={
            item.read
              ? "bell-outline"
              : "bell-ring-outline"
          }
          size={
            designSystem.iconSizes.md
          }
          color={
            designSystem.colors.primary
          }
        />
      </View>

      <View style={styles.textBlock}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>
            {item.title}
          </Text>

          {!item.read ? (
            <View
              style={styles.unreadDot}
            />
          ) : null}
        </View>

        {item.message ? (
          <Text style={styles.cardMessage}>
            {item.message}
          </Text>
        ) : null}

        <View style={styles.metaRow}>
          <Text style={styles.cardDate}>
            {formatNotificationDate(
              item.createdAt
            )}
          </Text>

          <Text style={styles.readState}>
            {isOpening
              ? "Abriendo..."
              : item.read
                ? "Leída"
                : "Sin leer"}
          </Text>
        </View>
      </View>

      {item.reservationId ? (
        <MaterialCommunityIcons
          name="chevron-right"
          size={
            designSystem.iconSizes.md
          }
          color={
            designSystem.colors.textMuted
          }
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      studentPalette.background,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    gap: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius:
      designSystem.radii.xl,
    backgroundColor:
      designSystem.colors
        .surfaceElevated,
    borderWidth: 1,
    borderColor:
      designSystem.colors.border,
    ...designSystem.shadows.low,
  },

  headerText: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    color:
      designSystem.colors
        .textPrimary,
    fontSize:
      typography.roles.screenTitle
        .fontSize,
    lineHeight:
      typography.roles.screenTitle
        .lineHeight,
    fontWeight:
      typography.roles.screenTitle
        .fontWeight,
  },

  subtitle: {
    color:
      designSystem.colors
        .textSecondary,
    fontSize:
      typography.sizes.sm,
  },

  headerAction: {
    maxWidth: 168,
  },

  feedback: {
    marginTop: spacing.md,
  },

  listError: {
    marginBottom: spacing.md,
  },

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
    backgroundColor:
      designSystem.colors
        .primaryFaint,
  },

  emptyCircleSmall: {
    position: "absolute",
    right: 8,
    bottom: 8,
    width: 46,
    height: 46,
    borderRadius: 999,
    backgroundColor:
      designSystem.colors
        .secondarySoft,
  },

  refreshButton: {
    marginTop: spacing.md,
    alignSelf: "center",
    minWidth: 160,
  },

  list: {
    flex: 1,
    backgroundColor: "transparent",
  },

  listContent: {
    gap: spacing.sm,
    paddingBottom: spacing.xxxl,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius:
      designSystem.radii.xl,
    backgroundColor:
      designSystem.colors
        .surfaceElevated,
    borderWidth: 1,
    borderColor:
      designSystem.colors.border,
    ...designSystem.shadows.low,
  },

  cardUnread: {
    borderColor:
      designSystem.colors
        .primarySoft,
  },

  cardPressed: {
    backgroundColor:
      designSystem.colors
        .surfacePressed,
  },

  cardDisabled: {
    opacity: 0.72,
  },

  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      designSystem.colors
        .primaryFaint,
  },

  textBlock: {
    flex: 1,
    gap: 3,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  cardTitle: {
    flex: 1,
    color:
      designSystem.colors
        .textPrimary,
    fontSize:
      typography.sizes.md,
    fontWeight:
      typography.weights.bold,
  },

  cardMessage: {
    color:
      designSystem.colors
        .textSecondary,
    fontSize:
      typography.sizes.sm,
    lineHeight:
      typography.lineHeights.sm,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    gap: spacing.sm,
    flexWrap: "wrap",
  },

  cardDate: {
    color:
      designSystem.colors
        .textMuted,
    fontSize:
      typography.sizes.xs,
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor:
      designSystem.colors.primary,
  },

  readState: {
    color:
      designSystem.colors
        .textMuted,
    fontSize:
      typography.sizes.xs,
    fontWeight:
      typography.weights.bold,
  },
});
