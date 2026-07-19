import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  NativeStackScreenProps,
} from "@react-navigation/native-stack";

import {
  ErrorMessage,
  LoadingState,
  Screen,
} from "../components";
import { spacing } from "../constants/spacing";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../navigation/routes";
import {
  RootStackParamList,
} from "../navigation/types";
import {
  getSuperAdminRestaurants,
  getSuperAdminUsers,
  SuperAdminRestaurant,
  SuperAdminUser,
} from "../services/superAdminService";
import {
  designSystem,
  typography,
} from "../theme";
import { useThemeColors } from "../hooks/useThemeColors";

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.SuperAdmin
>;

type DashboardStat = {
  key: string;
  label: string;
  value: number;
  iconName: React.ComponentProps<
    typeof MaterialCommunityIcons
  >["name"];
  tone: "primary" | "success" | "info";
};

type DashboardAction = {
  key: string;
  title: string;
  subtitle: string;
  iconName: React.ComponentProps<
    typeof MaterialCommunityIcons
  >["name"];
  onPress: () => void;
};

type AvailableFunction = {
  key: string;
  label: string;
  iconName: React.ComponentProps<
    typeof MaterialCommunityIcons
  >["name"];
  onPress: () => void;
};

function readErrorMessage(
  error: unknown
): string {
  if (
    error instanceof Error &&
    error.message.trim()
  ) {
    return error.message.trim();
  }

  return "No se pudo cargar la información.";
}

function getInitials(
  value?: string | null
): string {
  const normalized =
    value?.trim() ?? "";

  if (!normalized) {
    return "SA";
  }

  const parts = normalized
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return normalized
    .slice(0, 2)
    .toUpperCase();
}

export function SuperAdminScreen({
  navigation,
}: Props) {
  const theme = useThemeColors();

  const {
    accessToken,
    logout,
    user,
  } = useAuth();

  const [
    users,
    setUsers,
  ] = useState<
    SuperAdminUser[]
  >([]);

  const [
    restaurants,
    setRestaurants,
  ] = useState<
    SuperAdminRestaurant[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  const [
    isLoggingOut,
    setIsLoggingOut,
  ] = useState(false);

  const loadDashboard =
    useCallback(
      async (
        mode:
          | "initial"
          | "refresh" = "initial"
      ) => {
        if (!accessToken) {
          setError(
            "No existe una sesión activa."
          );

          setLoading(false);
          setRefreshing(false);
          return;
        }

        if (mode === "initial") {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        try {
          setError(null);

          const [
            userResult,
            restaurantResult,
          ] = await Promise.all([
            getSuperAdminUsers(
              accessToken
            ),

            getSuperAdminRestaurants(
              accessToken
            ),
          ]);

          setUsers(userResult);

          setRestaurants(
            restaurantResult
          );
        } catch (
          loadError: unknown
        ) {
          setError(
            readErrorMessage(
              loadError
            )
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [accessToken]
    );

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const totalManagers =
    useMemo(
      () =>
        users.filter(
          (item) =>
            item.role ===
            "MANAGER"
        ).length,
      [users]
    );

  const activeRestaurants =
    useMemo(
      () =>
        restaurants.filter(
          (item) =>
            item.isActive
        ).length,
      [restaurants]
    );

  const stats =
    useMemo<
      DashboardStat[]
    >(
      () => [
        {
          key: "users",
          label: "Usuarios",
          value: users.length,
          iconName:
            "account-group-outline",
          tone: "primary",
        },
        {
          key: "managers",
          label: "Managers",
          value: totalManagers,
          iconName:
            "account-tie-outline",
          tone: "info",
        },
        {
          key: "restaurants",
          label: "Restaurantes",
          value:
            restaurants.length,
          iconName:
            "storefront-outline",
          tone: "primary",
        },
        {
          key: "active",
          label:
            "Rest. activos",
          value:
            activeRestaurants,
          iconName:
            "check-circle-outline",
          tone: "success",
        },
      ],
      [
        activeRestaurants,
        restaurants.length,
        totalManagers,
        users.length,
      ]
    );

  const openUsers =
    useCallback(() => {
      navigation.navigate(
        ROUTES.SuperAdminUsers
      );
    }, [navigation]);

  const openRestaurants =
    useCallback(() => {
      navigation.navigate(
        ROUTES.SuperAdminRestaurants
      );
    }, [navigation]);

  const quickActions =
    useMemo<
      DashboardAction[]
    >(
      () => [
        {
          key: "manage-users",
          title:
            "Gestionar usuarios",
          subtitle:
            "Consultar roles y estados",
          iconName:
            "account-cog-outline",
          onPress: openUsers,
        },
        {
          key: "assign-manager",
          title:
            "Asignar manager",
          subtitle:
            "Seleccionar usuario y restaurante",
          iconName:
            "account-plus-outline",
          onPress: openUsers,
        },
        {
          key:
            "manage-restaurants",
          title:
            "Gestionar restaurantes",
          subtitle:
            "Crear, editar y administrar",
          iconName:
            "storefront-outline",
          onPress:
            openRestaurants,
        },
        {
          key:
            "change-status",
          title:
            "Cambiar estado",
          subtitle:
            "Activar, inactivar o suspender",
          iconName:
            "toggle-switch-outline",
          onPress: openUsers,
        },
      ],
      [
        openRestaurants,
        openUsers,
      ]
    );

  const availableFunctions =
    useMemo<
      AvailableFunction[]
    >(
      () => [
        {
          key: "view-users",
          label:
            "Ver usuarios",
          iconName:
            "account-search-outline",
          onPress: openUsers,
        },
        {
          key: "change-role",
          label:
            "Cambiar rol",
          iconName:
            "account-cog-outline",
          onPress: openUsers,
        },
        {
          key:
            "update-user-status",
          label:
            "Actualizar estado de usuario",
          iconName:
            "account-check-outline",
          onPress: openUsers,
        },
        {
          key:
            "create-restaurant",
          label:
            "Crear restaurante",
          iconName:
            "store-plus-outline",
          onPress:
            openRestaurants,
        },
        {
          key:
            "edit-restaurant",
          label:
            "Editar restaurante",
          iconName:
            "pencil-outline",
          onPress:
            openRestaurants,
        },
        {
          key:
            "toggle-restaurant",
          label:
            "Activar o desactivar restaurante",
          iconName: "power",
          onPress:
            openRestaurants,
        },
      ],
      [
        openRestaurants,
        openUsers,
      ]
    );

  const confirmLogout = () => {
    if (isLoggingOut) {
      return;
    }

    Alert.alert(
      "Cerrar sesión",
      "¿Deseas cerrar la sesión del superadministrador?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Cerrar sesión",
          style: "destructive",
          onPress: () => {
            void handleLogout();
          },
        },
      ]
    );
  };

  const handleLogout =
    async () => {
      if (isLoggingOut) {
        return;
      }

      try {
        setIsLoggingOut(true);

        await logout();
      } catch {
        Alert.alert(
          "No se pudo cerrar sesión",
          "Inténtalo nuevamente."
        );
      } finally {
        setIsLoggingOut(false);
      }
    };

  const displayEmail =
    user?.email?.trim() ||
    "superadministrador";

  const initials =
    getInitials(
      displayEmail.split("@")[0]
    );

  return (
    <Screen
      style={styles.container}
    >
      <View
        pointerEvents="none"
        style={[
          styles.backgroundDecor,
          {
            backgroundColor:
              theme.primaryFaint,
          },
        ]}
      />

      <View
        pointerEvents="none"
        style={[
          styles.backgroundDecorSmall,
          {
            backgroundColor:
              theme.primarySoft,
          },
        ]}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              void loadDashboard(
                "refresh"
              );
            }}
            tintColor={
              theme.primary
            }
            colors={[
              theme.primary,
            ]}
          />
        }
      >
        <View
          style={styles.header}
        >
          <View
            style={
              styles.headerText
            }
          >
            <Text
              style={[
                styles.title,
                {
                  color:
                    theme.textPrimary,
                },
              ]}
            >
              Superadministrador
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  color:
                    theme.textSecondary,
                },
              ]}
            >
              Gestión general del sistema
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
            disabled={isLoggingOut}
            onPress={
              confirmLogout
            }
            style={({
              pressed,
            }) => [
              styles.logoutButton,
              {
                backgroundColor:
                  theme.surfaceElevated,

                borderColor:
                  theme.primarySoft,
              },
              pressed &&
                styles.pressed,
              isLoggingOut &&
                styles.disabled,
            ]}
          >
            <MaterialCommunityIcons
              name="logout"
              size={18}
              color={
                theme.primary
              }
            />

            <Text
              style={[
                styles.logoutText,
                {
                  color:
                    theme.primary,
                },
              ]}
            >
              {isLoggingOut
                ? "Cerrando..."
                : "Salir"}
            </Text>
          </Pressable>
        </View>

        <View
          style={[
            styles.profileCard,
            {
              backgroundColor:
                theme.surfaceElevated,

              borderColor:
                theme.border,
            },
          ]}
        >
          <View
            style={[
              styles.avatar,
              {
                backgroundColor:
                  theme.primaryFaint,

                borderColor:
                  theme.primarySoft,
              },
            ]}
          >
            <Text
              style={[
                styles.avatarText,
                {
                  color:
                    theme.primary,
                },
              ]}
            >
              {initials}
            </Text>
          </View>

          <View
            style={
              styles.profileText
            }
          >
            <Text
              style={[
                styles.profileTitle,
                {
                  color:
                    theme.textPrimary,
                },
              ]}
            >
              Superadministrador
            </Text>

            <Text
              numberOfLines={1}
              style={[
                styles.profileEmail,
                {
                  color:
                    theme.textSecondary,
                },
              ]}
            >
              {displayEmail}
            </Text>

            <View
              style={[
                styles.accessBadge,
                {
                  backgroundColor:
                    theme.successSoft,

                  borderColor:
                    theme.successBorder,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={14}
                color={
                  theme.success
                }
              />

              <Text
                style={[
                  styles.accessBadgeText,
                  {
                    color:
                      theme.success,
                  },
                ]}
              >
                Acceso total
              </Text>
            </View>
          </View>

          <MaterialCommunityIcons
            name="shield-account-outline"
            size={48}
            color={
              theme.primarySoft
            }
          />
        </View>

        {loading ? (
          <LoadingState
            message="Cargando información..."
            style={
              styles.feedback
            }
          />
        ) : error ? (
          <ErrorMessage
            title="No se pudo cargar"
            message={error}
            onRetry={() => {
              void loadDashboard();
            }}
            style={
              styles.feedback
            }
          />
        ) : (
          <>
            <View
              style={
                styles.statsGrid
              }
            >
              {stats.map(
                (stat) => (
                  <StatCard
                    key={stat.key}
                    stat={stat}
                  />
                )
              )}
            </View>

            <SectionHeader
              iconName="lightning-bolt-outline"
              title="Accesos rápidos"
            />

            <View
              style={
                styles.actionsGrid
              }
            >
              {quickActions.map(
                (action) => (
                  <QuickActionCard
                    key={
                      action.key
                    }
                    action={
                      action
                    }
                  />
                )
              )}
            </View>

            <SectionHeader
              iconName="cog-outline"
              title="Funciones disponibles"
            />

            <View
              style={[
                styles.functionsCard,
                {
                  backgroundColor:
                    theme.surfaceElevated,

                  borderColor:
                    theme.border,
                },
              ]}
            >
              {availableFunctions.map(
                (
                  item,
                  index
                ) => (
                  <FunctionRow
                    key={item.key}
                    item={item}
                    showDivider={
                      index <
                      availableFunctions.length -
                        1
                    }
                  />
                )
              )}
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

function SectionHeader({
  iconName,
  title,
}: {
  iconName: React.ComponentProps<
    typeof MaterialCommunityIcons
  >["name"];
  title: string;
}) {
  const theme =
    useThemeColors();

  return (
    <View
      style={
        styles.sectionHeader
      }
    >
      <View
        style={[
          styles.sectionIcon,
          {
            backgroundColor:
              theme.primaryFaint,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={iconName}
          size={19}
          color={theme.primary}
        />
      </View>

      <Text
        style={[
          styles.sectionTitle,
          {
            color:
              theme.textPrimary,
          },
        ]}
      >
        {title}
      </Text>
    </View>
  );
}

function StatCard({
  stat,
}: {
  stat: DashboardStat;
}) {
  const theme =
    useThemeColors();

  const accentColor =
    stat.tone === "success"
      ? theme.success
      : stat.tone === "info"
        ? theme.info
        : theme.primary;

  const backgroundColor =
    stat.tone === "success"
      ? theme.successSoft
      : stat.tone === "info"
        ? theme.infoSoft
        : theme.primaryFaint;

  return (
    <View
      style={[
        styles.statCard,
        {
          backgroundColor:
            theme.surfaceElevated,

          borderColor:
            theme.border,
        },
      ]}
    >
      <View
        style={[
          styles.statIcon,
          {
            backgroundColor,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={stat.iconName}
          size={22}
          color={accentColor}
        />
      </View>

      <View
        style={
          styles.statText
        }
      >
        <Text
          style={[
            styles.statLabel,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          {stat.label}
        </Text>

        <Text
          style={[
            styles.statValue,
            {
              color:
                theme.textPrimary,
            },
          ]}
        >
          {stat.value}
        </Text>
      </View>
    </View>
  );
}

function QuickActionCard({
  action,
}: {
  action: DashboardAction;
}) {
  const theme =
    useThemeColors();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        action.title
      }
      onPress={
        action.onPress
      }
      style={({ pressed }) => [
        styles.actionCard,
        {
          backgroundColor:
            theme.surfaceElevated,

          borderColor:
            theme.border,
        },
        pressed &&
          styles.pressed,
      ]}
    >
      <View
        style={[
          styles.actionIcon,
          {
            backgroundColor:
              theme.primaryFaint,

            borderColor:
              theme.primarySoft,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={
            action.iconName
          }
          size={23}
          color={
            theme.primary
          }
        />
      </View>

      <View
        style={
          styles.actionText
        }
      >
        <Text
          style={[
            styles.actionTitle,
            {
              color:
                theme.textPrimary,
            },
          ]}
        >
          {action.title}
        </Text>

        <Text
          style={[
            styles.actionSubtitle,
            {
              color:
                theme.textMuted,
            },
          ]}
        >
          {action.subtitle}
        </Text>
      </View>

      <MaterialCommunityIcons
        name="chevron-right"
        size={20}
        color={
          theme.textMuted
        }
      />
    </Pressable>
  );
}

function FunctionRow({
  item,
  showDivider,
}: {
  item: AvailableFunction;
  showDivider: boolean;
}) {
  const theme =
    useThemeColors();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        item.label
      }
      onPress={
        item.onPress
      }
      style={({ pressed }) => [
        styles.functionRow,
        showDivider && {
          borderBottomWidth: 1,
          borderBottomColor:
            theme.divider,
        },
        pressed &&
          styles.functionPressed,
      ]}
    >
      <View
        style={[
          styles.functionIcon,
          {
            backgroundColor:
              theme.primaryFaint,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={
            item.iconName
          }
          size={20}
          color={
            theme.primary
          }
        />
      </View>

      <Text
        style={[
          styles.functionLabel,
          {
            color:
              theme.textPrimary,
          },
        ]}
      >
        {item.label}
      </Text>

      <MaterialCommunityIcons
        name="chevron-right"
        size={21}
        color={
          theme.textMuted
        }
      />
    </Pressable>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
    },

    scroll: {
      flex: 1,
      backgroundColor:
        "transparent",
    },

    content: {
      gap: spacing.lg,
      paddingBottom:
        spacing.xxxl,
    },

    backgroundDecor: {
      position: "absolute",
      top: -105,
      right: -100,
      width: 280,
      height: 280,
      borderRadius: 999,
      opacity: 0.72,
    },

    backgroundDecorSmall: {
      position: "absolute",
      top: 70,
      left: -90,
      width: 190,
      height: 190,
      borderRadius: 999,
      opacity: 0.24,
    },

    header: {
      minHeight: 62,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      gap: spacing.md,
    },

    headerText: {
      flex: 1,
      minWidth: 0,
    },

    title: {
      fontSize:
        typography.roles.heroTitle
          .fontSize,
      lineHeight:
        typography.roles.heroTitle
          .lineHeight,
      fontWeight:
        typography.roles.heroTitle
          .fontWeight,
    },

    subtitle: {
      marginTop: 2,
      fontSize:
        typography.sizes.sm,
      lineHeight:
        typography.lineHeights.sm,
    },

    logoutButton: {
      minHeight: 40,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: spacing.xs,
      paddingHorizontal:
        spacing.md,
      borderRadius:
        designSystem.radii.pill,
      borderWidth: 1,
    },

    logoutText: {
      fontSize:
        typography.sizes.xs,
      fontWeight:
        typography.weights.bold,
    },

    profileCard: {
      minHeight: 118,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      padding: spacing.lg,
      borderRadius:
        designSystem.radii.xl,
      borderWidth: 1,
      ...designSystem.shadows.medium,
    },

    avatar: {
      width: 62,
      height: 62,
      borderRadius: 999,
      alignItems: "center",
      justifyContent:
        "center",
      borderWidth: 1,
    },

    avatarText: {
      fontSize:
        typography.sizes.xl,
      fontWeight:
        typography.weights.extraBold,
    },

    profileText: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },

    profileTitle: {
      fontSize:
        typography.sizes.lg,
      lineHeight:
        typography.lineHeights.lg,
      fontWeight:
        typography.weights.bold,
    },

    profileEmail: {
      fontSize:
        typography.sizes.sm,
      lineHeight:
        typography.lineHeights.sm,
    },

    accessBadge: {
      alignSelf: "flex-start",
      minHeight: 25,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: spacing.xs,
      paddingHorizontal:
        spacing.sm,
      borderRadius:
        designSystem.radii.pill,
      borderWidth: 1,
    },

    accessBadgeText: {
      fontSize:
        typography.sizes.xs,
      fontWeight:
        typography.weights.bold,
    },

    feedback: {
      marginTop: spacing.sm,
    },

    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },

    statCard: {
      width: "48%",
      minHeight: 92,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius:
        designSystem.radii.lg,
      borderWidth: 1,
      ...designSystem.shadows.low,
    },

    statIcon: {
      width: 42,
      height: 42,
      borderRadius: 999,
      alignItems: "center",
      justifyContent:
        "center",
    },

    statText: {
      flex: 1,
      minWidth: 0,
    },

    statLabel: {
      fontSize:
        typography.sizes.xs,
      lineHeight:
        typography.lineHeights.xs,
      fontWeight:
        typography.weights.semiBold,
    },

    statValue: {
      marginTop: 2,
      fontSize:
        typography.sizes.xl,
      lineHeight:
        typography.lineHeights.xl,
      fontWeight:
        typography.weights.extraBold,
    },

    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginTop: spacing.xs,
    },

    sectionIcon: {
      width: 34,
      height: 34,
      borderRadius: 999,
      alignItems: "center",
      justifyContent:
        "center",
    },

    sectionTitle: {
      flex: 1,
      fontSize:
        typography.roles.sectionTitle
          .fontSize,
      lineHeight:
        typography.roles.sectionTitle
          .lineHeight,
      fontWeight:
        typography.roles.sectionTitle
          .fontWeight,
    },

    actionsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },

    actionCard: {
      width: "48%",
      minHeight: 138,
      justifyContent:
        "space-between",
      padding: spacing.md,
      borderRadius:
        designSystem.radii.xl,
      borderWidth: 1,
      ...designSystem.shadows.low,
    },

    actionIcon: {
      width: 44,
      height: 44,
      borderRadius: 16,
      alignItems: "center",
      justifyContent:
        "center",
      borderWidth: 1,
    },

    actionText: {
      flex: 1,
      justifyContent:
        "flex-end",
      paddingTop: spacing.md,
    },

    actionTitle: {
      fontSize:
        typography.sizes.md,
      lineHeight:
        typography.lineHeights.md,
      fontWeight:
        typography.weights.bold,
    },

    actionSubtitle: {
      marginTop: 3,
      fontSize:
        typography.sizes.xs,
      lineHeight:
        typography.lineHeights.xs,
    },

    functionsCard: {
      overflow: "hidden",
      borderRadius:
        designSystem.radii.xl,
      borderWidth: 1,
      ...designSystem.shadows.low,
    },

    functionRow: {
      minHeight: 62,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      paddingHorizontal:
        spacing.md,
    },

    functionPressed: {
      opacity: 0.75,
    },

    functionIcon: {
      width: 38,
      height: 38,
      borderRadius: 999,
      alignItems: "center",
      justifyContent:
        "center",
    },

    functionLabel: {
      flex: 1,
      fontSize:
        typography.sizes.sm,
      lineHeight:
        typography.lineHeights.sm,
      fontWeight:
        typography.weights.semiBold,
    },

    pressed: {
      opacity: 0.84,
      transform: [
        {
          scale: 0.985,
        },
      ],
    },

    disabled: {
      opacity: 0.55,
    },
  });
