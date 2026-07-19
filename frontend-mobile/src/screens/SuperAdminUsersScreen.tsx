import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import {
  ErrorMessage,
  LoadingState,
  Screen,
} from "../components";
import { spacing } from "../constants/spacing";
import { useAuth } from "../context/AuthContext";
import { useThemeColors } from "../hooks/useThemeColors";
import { ROUTES } from "../navigation/routes";
import { SuperAdminStackParamList } from "../navigation/types";
import {
  getSuperAdminUsers,
  SuperAdminUser,
} from "../services/superAdminService";
import {
  designSystem,
  typography,
} from "../theme";

type Navigation =
  NativeStackNavigationProp<SuperAdminStackParamList>;

type RoleFilter =
  | "ALL"
  | SuperAdminUser["role"];

type StatusFilter =
  | "ALL"
  | SuperAdminUser["status"];

const ROLE_LABELS = {
  ALL: "Todos",
  STUDENT: "Estudiantes",
  MANAGER: "Managers",
  SUPER_ADMIN: "Superadministradores",
} as const;

const STATUS_LABELS = {
  ALL: "Todos",
  ACTIVE: "Activos",
  INACTIVE: "Inactivos",
  SUSPENDED: "Suspendidos",
} as const;

const ROLE_FILTERS: RoleFilter[] = [
  "ALL",
  "STUDENT",
  "MANAGER",
  "SUPER_ADMIN",
];

const STATUS_FILTERS: StatusFilter[] = [
  "ALL",
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
];

function readErrorMessage(
  error: unknown
): string {
  if (
    error instanceof Error &&
    error.message.trim()
  ) {
    return error.message.trim();
  }

  return "No se pudieron cargar los usuarios.";
}

function getInitials(
  fullName: string
): string {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return fullName
    .trim()
    .slice(0, 2)
    .toUpperCase();
}

function getShortId(
  userId: string
): string {
  if (userId.length <= 18) {
    return userId;
  }

  return `${userId.slice(
    0,
    8
  )}...${userId.slice(-5)}`;
}

export function SuperAdminUsersScreen() {
  const theme = useThemeColors();
  const navigation =
    useNavigation<Navigation>();

  const { accessToken } = useAuth();

  const [
    users,
    setUsers,
  ] = useState<SuperAdminUser[]>([]);

  const [
    searchText,
    setSearchText,
  ] = useState("");

  const [
    roleFilter,
    setRoleFilter,
  ] = useState<RoleFilter>("ALL");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<StatusFilter>("ALL");

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
  ] = useState<string | null>(null);

  const loadUsers = useCallback(
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

        const result =
          await getSuperAdminUsers(
            accessToken
          );

        setUsers(result);
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
    void loadUsers();
  }, [loadUsers]);

  const filteredUsers =
    useMemo(() => {
      const normalizedSearch =
        searchText
          .trim()
          .toLowerCase();

      return users.filter(
        (user) => {
          const matchesSearch =
            !normalizedSearch ||
            user.fullName
              .toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            user.id
              .toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            (
              user.restaurantName ??
              ""
            )
              .toLowerCase()
              .includes(
                normalizedSearch
              );

          const matchesRole =
            roleFilter === "ALL" ||
            user.role === roleFilter;

          const matchesStatus =
            statusFilter === "ALL" ||
            user.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesRole &&
            matchesStatus
          );
        }
      );
    }, [
      roleFilter,
      searchText,
      statusFilter,
      users,
    ]);

  const activeUsersCount =
    useMemo(
      () =>
        users.filter(
          (user) =>
            user.status ===
            "ACTIVE"
        ).length,
      [users]
    );

  const managerCount =
    useMemo(
      () =>
        users.filter(
          (user) =>
            user.role ===
            "MANAGER"
        ).length,
      [users]
    );

  const clearFilters = () => {
    setSearchText("");
    setRoleFilter("ALL");
    setStatusFilter("ALL");
  };

  const hasActiveFilters =
    searchText.trim().length > 0 ||
    roleFilter !== "ALL" ||
    statusFilter !== "ALL";

  const openUserDetail = (
    userId: string
  ) => {
    navigation.navigate(
      ROUTES.SuperAdminUserDetail,
      {
        userId,
      }
    );
  };

  return (
    <Screen
      style={styles.container}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              void loadUsers(
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
              Usuarios
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
              Consulta y administra las cuentas del sistema
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Actualizar usuarios"
            disabled={
              loading ||
              refreshing
            }
            onPress={() => {
              void loadUsers(
                "refresh"
              );
            }}
            style={({
              pressed,
            }) => [
              styles.refreshButton,
              {
                backgroundColor:
                  theme.surfaceElevated,

                borderColor:
                  theme.border,
              },
              pressed &&
                styles.pressed,
              (
                loading ||
                refreshing
              ) &&
                styles.disabled,
            ]}
          >
            <MaterialCommunityIcons
              name="refresh"
              size={21}
              color={
                theme.primary
              }
            />
          </Pressable>
        </View>

        <View
          style={
            styles.summaryGrid
          }
        >
          <SummaryCard
            iconName="account-group-outline"
            label="Total"
            value={users.length}
            tone="primary"
          />

          <SummaryCard
            iconName="account-check-outline"
            label="Activos"
            value={
              activeUsersCount
            }
            tone="success"
          />

          <SummaryCard
            iconName="account-tie-outline"
            label="Managers"
            value={managerCount}
            tone="info"
          />
        </View>

        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor:
                theme.surfaceElevated,

              borderColor:
                theme.border,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="magnify"
            size={22}
            color={
              theme.textMuted
            }
          />

          <TextInput
            value={searchText}
            onChangeText={
              setSearchText
            }
            placeholder="Buscar por nombre, ID o restaurante"
            placeholderTextColor={
              theme.textMuted
            }
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            style={[
              styles.searchInput,
              {
                color:
                  theme.textPrimary,
              },
            ]}
          />

          {searchText.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Limpiar búsqueda"
              onPress={() =>
                setSearchText("")
              }
              style={({ pressed }) => [
                styles.clearSearchButton,
                pressed &&
                  styles.pressed,
              ]}
            >
              <MaterialCommunityIcons
                name="close-circle"
                size={21}
                color={
                  theme.textMuted
                }
              />
            </Pressable>
          ) : null}
        </View>

        <FilterSection
          title="Filtrar por rol"
          iconName="account-switch-outline"
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.filterRow
            }
          >
            {ROLE_FILTERS.map(
              (role) => (
                <FilterChip
                  key={role}
                  label={
                    ROLE_LABELS[
                      role
                    ]
                  }
                  selected={
                    roleFilter ===
                    role
                  }
                  onPress={() =>
                    setRoleFilter(
                      role
                    )
                  }
                />
              )
            )}
          </ScrollView>
        </FilterSection>

        <FilterSection
          title="Filtrar por estado"
          iconName="filter-variant"
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.filterRow
            }
          >
            {STATUS_FILTERS.map(
              (status) => (
                <FilterChip
                  key={status}
                  label={
                    STATUS_LABELS[
                      status
                    ]
                  }
                  selected={
                    statusFilter ===
                    status
                  }
                  onPress={() =>
                    setStatusFilter(
                      status
                    )
                  }
                />
              )
            )}
          </ScrollView>
        </FilterSection>

        <View
          style={
            styles.resultHeader
          }
        >
          <View
            style={
              styles.resultText
            }
          >
            <Text
              style={[
                styles.resultTitle,
                {
                  color:
                    theme.textPrimary,
                },
              ]}
            >
              Lista de usuarios
            </Text>

            <Text
              style={[
                styles.resultCount,
                {
                  color:
                    theme.textSecondary,
                },
              ]}
            >
              {filteredUsers.length} de{" "}
              {users.length}
            </Text>
          </View>

          {hasActiveFilters ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Limpiar filtros"
              onPress={
                clearFilters
              }
              style={({
                pressed,
              }) => [
                styles.clearFiltersButton,
                {
                  backgroundColor:
                    theme.primaryFaint,

                  borderColor:
                    theme.primarySoft,
                },
                pressed &&
                  styles.pressed,
              ]}
            >
              <MaterialCommunityIcons
                name="filter-remove-outline"
                size={17}
                color={
                  theme.primary
                }
              />

              <Text
                style={[
                  styles.clearFiltersText,
                  {
                    color:
                      theme.primary,
                  },
                ]}
              >
                Limpiar
              </Text>
            </Pressable>
          ) : null}
        </View>

        {loading ? (
          <LoadingState
            message="Cargando usuarios..."
            style={
              styles.feedback
            }
          />
        ) : error ? (
          <ErrorMessage
            title="No se pudieron cargar los usuarios"
            message={error}
            onRetry={() => {
              void loadUsers();
            }}
            style={
              styles.feedback
            }
          />
        ) : filteredUsers.length ===
          0 ? (
          <View
            style={[
              styles.emptyCard,
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
                styles.emptyIcon,
                {
                  backgroundColor:
                    theme.primaryFaint,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="account-search-outline"
                size={36}
                color={
                  theme.primary
                }
              />
            </View>

            <Text
              style={[
                styles.emptyTitle,
                {
                  color:
                    theme.textPrimary,
                },
              ]}
            >
              No se encontraron usuarios
            </Text>

            <Text
              style={[
                styles.emptyDescription,
                {
                  color:
                    theme.textSecondary,
                },
              ]}
            >
              Modifica la búsqueda o los filtros seleccionados.
            </Text>

            {hasActiveFilters ? (
              <Pressable
                accessibilityRole="button"
                onPress={
                  clearFilters
                }
                style={({
                  pressed,
                }) => [
                  styles.emptyButton,
                  {
                    backgroundColor:
                      theme.primary,
                  },
                  pressed &&
                    styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.emptyButtonText,
                    {
                      color:
                        theme.textInverted,
                    },
                  ]}
                >
                  Limpiar filtros
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : (
          <View
            style={
              styles.userList
            }
          >
            {filteredUsers.map(
              (user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onPress={() =>
                    openUserDetail(
                      user.id
                    )
                  }
                />
              )
            )}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

function FilterSection({
  title,
  iconName,
  children,
}: {
  title: string;
  iconName: React.ComponentProps<
    typeof MaterialCommunityIcons
  >["name"];
  children: React.ReactNode;
}) {
  const theme = useThemeColors();

  return (
    <View
      style={
        styles.filterSection
      }
    >
      <View
        style={
          styles.filterTitleRow
        }
      >
        <MaterialCommunityIcons
          name={iconName}
          size={18}
          color={
            theme.primary
          }
        />

        <Text
          style={[
            styles.filterTitle,
            {
              color:
                theme.textPrimary,
            },
          ]}
        >
          {title}
        </Text>
      </View>

      {children}
    </View>
  );
}

function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useThemeColors();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{
        selected,
      }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterChip,
        {
          backgroundColor:
            selected
              ? theme.primary
              : theme.surfaceElevated,

          borderColor:
            selected
              ? theme.primary
              : theme.border,
        },
        pressed &&
          styles.pressed,
      ]}
    >
      {selected ? (
        <MaterialCommunityIcons
          name="check"
          size={15}
          color={
            theme.textInverted
          }
        />
      ) : null}

      <Text
        style={[
          styles.filterChipText,
          {
            color:
              selected
                ? theme.textInverted
                : theme.textSecondary,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function SummaryCard({
  iconName,
  label,
  value,
  tone,
}: {
  iconName: React.ComponentProps<
    typeof MaterialCommunityIcons
  >["name"];
  label: string;
  value: number;
  tone:
    | "primary"
    | "success"
    | "info";
}) {
  const theme = useThemeColors();

  const accentColor =
    tone === "success"
      ? theme.success
      : tone === "info"
        ? theme.info
        : theme.primary;

  const iconBackground =
    tone === "success"
      ? theme.successSoft
      : tone === "info"
        ? theme.infoSoft
        : theme.primaryFaint;

  return (
    <View
      style={[
        styles.summaryCard,
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
          styles.summaryIcon,
          {
            backgroundColor:
              iconBackground,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={iconName}
          size={21}
          color={
            accentColor
          }
        />
      </View>

      <Text
        style={[
          styles.summaryValue,
          {
            color:
              theme.textPrimary,
          },
        ]}
      >
        {value}
      </Text>

      <Text
        style={[
          styles.summaryLabel,
          {
            color:
              theme.textSecondary,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function UserCard({
  user,
  onPress,
}: {
  user: SuperAdminUser;
  onPress: () => void;
}) {
  const theme = useThemeColors();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Administrar usuario ${user.fullName}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.userCard,
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
          {getInitials(
            user.fullName
          )}
        </Text>
      </View>

      <View
        style={
          styles.userInformation
        }
      >
        <Text
          numberOfLines={1}
          style={[
            styles.userName,
            {
              color:
                theme.textPrimary,
            },
          ]}
        >
          {user.fullName}
        </Text>

        <Text
          numberOfLines={1}
          style={[
            styles.userId,
            {
              color:
                theme.textMuted,
            },
          ]}
        >
          ID:{" "}
          {getShortId(
            user.id
          )}
        </Text>

        <View
          style={
            styles.badgeRow
          }
        >
          <RoleBadge
            role={user.role}
          />

          <StatusBadge
            status={
              user.status
            }
          />
        </View>

        <View
          style={
            styles.restaurantRow
          }
        >
          <MaterialCommunityIcons
            name="storefront-outline"
            size={15}
            color={
              theme.textMuted
            }
          />

          <Text
            numberOfLines={1}
            style={[
              styles.restaurantText,
              {
                color:
                  theme.textSecondary,
              },
            ]}
          >
            {user.restaurantName ??
              "Sin restaurante asignado"}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.manageButton,
          {
            backgroundColor:
              theme.primaryFaint,
          },
        ]}
      >
        <MaterialCommunityIcons
          name="chevron-right"
          size={23}
          color={
            theme.primary
          }
        />
      </View>
    </Pressable>
  );
}

function RoleBadge({
  role,
}: {
  role: SuperAdminUser["role"];
}) {
  const theme = useThemeColors();

  const color =
    role === "SUPER_ADMIN"
      ? theme.warning
      : role === "MANAGER"
        ? theme.info
        : theme.primary;

  const backgroundColor =
    role === "SUPER_ADMIN"
      ? theme.warningSoft
      : role === "MANAGER"
        ? theme.infoSoft
        : theme.primaryFaint;

  const label =
    role === "SUPER_ADMIN"
      ? "Superadmin"
      : role === "MANAGER"
        ? "Manager"
        : "Estudiante";

  const iconName =
    role === "SUPER_ADMIN"
      ? "shield-account-outline"
      : role === "MANAGER"
        ? "account-tie-outline"
        : "school-outline";

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor,
          borderColor: color,
        },
      ]}
    >
      <MaterialCommunityIcons
        name={iconName}
        size={13}
        color={color}
      />

      <Text
        style={[
          styles.badgeText,
          {
            color,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function StatusBadge({
  status,
}: {
  status: SuperAdminUser["status"];
}) {
  const theme = useThemeColors();

  const color =
    status === "ACTIVE"
      ? theme.success
      : status === "SUSPENDED"
        ? theme.danger
        : theme.warning;

  const backgroundColor =
    status === "ACTIVE"
      ? theme.successSoft
      : status === "SUSPENDED"
        ? theme.dangerSoft
        : theme.warningSoft;

  const label =
    status === "ACTIVE"
      ? "Activo"
      : status === "SUSPENDED"
        ? "Suspendido"
        : "Inactivo";

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor,
          borderColor: color,
        },
      ]}
    >
      <View
        style={[
          styles.statusDot,
          {
            backgroundColor:
              color,
          },
        ]}
      />

      <Text
        style={[
          styles.badgeText,
          {
            color,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
    },

    scroll: {
      flex: 1,
    },

    content: {
      gap: spacing.lg,
      paddingBottom:
        spacing.xxxl,
    },

    header: {
      minHeight: 64,
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

    refreshButton: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      borderRadius:
        designSystem.radii.pill,
      borderWidth: 1,
    },

    summaryGrid: {
      flexDirection: "row",
      gap: spacing.sm,
    },

    summaryCard: {
      flex: 1,
      minHeight: 104,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.sm,
      borderRadius:
        designSystem.radii.lg,
      borderWidth: 1,
      ...designSystem.shadows.low,
    },

    summaryIcon: {
      width: 38,
      height: 38,
      alignItems: "center",
      justifyContent: "center",
      borderRadius:
        designSystem.radii.pill,
    },

    summaryValue: {
      marginTop: spacing.xs,
      fontSize:
        typography.sizes.xl,
      lineHeight:
        typography.lineHeights.xl,
      fontWeight:
        typography.weights.extraBold,
    },

    summaryLabel: {
      marginTop: 1,
      fontSize:
        typography.sizes.xs,
      lineHeight:
        typography.lineHeights.xs,
      fontWeight:
        typography.weights.semiBold,
      textAlign: "center",
    },

    searchContainer: {
      minHeight: 52,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingHorizontal:
        spacing.md,
      borderRadius:
        designSystem.radii.lg,
      borderWidth: 1,
    },

    searchInput: {
      flex: 1,
      minWidth: 0,
      paddingVertical:
        spacing.sm,
      fontSize:
        typography.sizes.sm,
      lineHeight:
        typography.lineHeights.sm,
    },

    clearSearchButton: {
      width: 34,
      height: 34,
      alignItems: "center",
      justifyContent: "center",
      borderRadius:
        designSystem.radii.pill,
    },

    filterSection: {
      gap: spacing.sm,
    },

    filterTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },

    filterTitle: {
      fontSize:
        typography.sizes.sm,
      lineHeight:
        typography.lineHeights.sm,
      fontWeight:
        typography.weights.bold,
    },

    filterRow: {
      gap: spacing.sm,
      paddingRight:
        spacing.lg,
    },

    filterChip: {
      minHeight: 38,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      paddingHorizontal:
        spacing.md,
      borderRadius:
        designSystem.radii.pill,
      borderWidth: 1,
    },

    filterChipText: {
      fontSize:
        typography.sizes.xs,
      lineHeight:
        typography.lineHeights.xs,
      fontWeight:
        typography.weights.bold,
    },

    resultHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      gap: spacing.md,
    },

    resultText: {
      flex: 1,
    },

    resultTitle: {
      fontSize:
        typography.sizes.lg,
      lineHeight:
        typography.lineHeights.lg,
      fontWeight:
        typography.weights.bold,
    },

    resultCount: {
      marginTop: 2,
      fontSize:
        typography.sizes.xs,
      lineHeight:
        typography.lineHeights.xs,
    },

    clearFiltersButton: {
      minHeight: 36,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      paddingHorizontal:
        spacing.sm,
      borderRadius:
        designSystem.radii.pill,
      borderWidth: 1,
    },

    clearFiltersText: {
      fontSize:
        typography.sizes.xs,
      fontWeight:
        typography.weights.bold,
    },

    feedback: {
      marginTop: spacing.lg,
    },

    emptyCard: {
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      padding: spacing.xl,
      borderRadius:
        designSystem.radii.xl,
      borderWidth: 1,
      borderStyle: "dashed",
    },

    emptyIcon: {
      width: 72,
      height: 72,
      alignItems: "center",
      justifyContent: "center",
      borderRadius:
        designSystem.radii.pill,
    },

    emptyTitle: {
      marginTop: spacing.xs,
      fontSize:
        typography.sizes.lg,
      lineHeight:
        typography.lineHeights.lg,
      fontWeight:
        typography.weights.bold,
      textAlign: "center",
    },

    emptyDescription: {
      maxWidth: 280,
      fontSize:
        typography.sizes.sm,
      lineHeight:
        typography.lineHeights.sm,
      textAlign: "center",
    },

    emptyButton: {
      minHeight: 42,
      alignItems: "center",
      justifyContent: "center",
      marginTop: spacing.sm,
      paddingHorizontal:
        spacing.lg,
      borderRadius:
        designSystem.radii.button,
    },

    emptyButtonText: {
      fontSize:
        typography.sizes.sm,
      lineHeight:
        typography.lineHeights.sm,
      fontWeight:
        typography.weights.bold,
    },

    userList: {
      gap: spacing.sm,
    },

    userCard: {
      minHeight: 134,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      padding: spacing.md,
      borderRadius:
        designSystem.radii.xl,
      borderWidth: 1,
      ...designSystem.shadows.low,
    },

    avatar: {
      width: 54,
      height: 54,
      alignItems: "center",
      justifyContent: "center",
      borderRadius:
        designSystem.radii.pill,
      borderWidth: 1,
    },

    avatarText: {
      fontSize:
        typography.sizes.md,
      lineHeight:
        typography.lineHeights.md,
      fontWeight:
        typography.weights.extraBold,
    },

    userInformation: {
      flex: 1,
      minWidth: 0,
    },

    userName: {
      fontSize:
        typography.sizes.md,
      lineHeight:
        typography.lineHeights.md,
      fontWeight:
        typography.weights.bold,
    },

    userId: {
      marginTop: 2,
      fontSize:
        typography.sizes.xs,
      lineHeight:
        typography.lineHeights.xs,
    },

    badgeRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.xs,
      marginTop: spacing.sm,
    },

    badge: {
      minHeight: 25,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal:
        spacing.sm,
      borderRadius:
        designSystem.radii.pill,
      borderWidth: 1,
    },

    badgeText: {
      fontSize: 10,
      lineHeight: 13,
      fontWeight:
        typography.weights.bold,
    },

    statusDot: {
      width: 7,
      height: 7,
      borderRadius:
        designSystem.radii.pill,
    },

    restaurantRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      marginTop: spacing.sm,
    },

    restaurantText: {
      flex: 1,
      minWidth: 0,
      fontSize:
        typography.sizes.xs,
      lineHeight:
        typography.lineHeights.xs,
    },

    manageButton: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
      borderRadius:
        designSystem.radii.pill,
    },

    pressed: {
      opacity: 0.8,
      transform: [
        {
          scale: 0.985,
        },
      ],
    },

    disabled: {
      opacity: 0.5,
    },
  });