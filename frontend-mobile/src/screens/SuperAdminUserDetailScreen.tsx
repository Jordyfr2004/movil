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
import { NativeStackScreenProps } from "@react-navigation/native-stack";

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
  assignManager,
  changeUserRole,
  changeUserStatus,
  getSuperAdminRestaurants,
  getSuperAdminUsers,
  SuperAdminRestaurant,
  SuperAdminUser,
  SuperAdminUserStatus,
} from "../services/superAdminService";
import {
  designSystem,
  typography,
} from "../theme";

type Props = NativeStackScreenProps<
  SuperAdminStackParamList,
  typeof ROUTES.SuperAdminUserDetail
>;

type ActionKey =
  | "student"
  | "manager"
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED"
  | null;

const ROLE_LABELS = {
  STUDENT: "Estudiante",
  MANAGER: "Manager",
  SUPER_ADMIN: "Superadministrador",
} as const;

const STATUS_LABELS = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  SUSPENDED: "Suspendido",
} as const;

function readErrorMessage(
  error: unknown
): string {
  if (
    error instanceof Error &&
    error.message.trim()
  ) {
    return error.message.trim();
  }

  return "No se pudo completar la operación.";
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

export function SuperAdminUserDetailScreen({
  navigation,
  route,
}: Props) {
  const theme = useThemeColors();
  const { accessToken } = useAuth();

  const { userId } = route.params;

  const [
    user,
    setUser,
  ] =
    useState<SuperAdminUser | null>(
      null
    );

  const [
    restaurants,
    setRestaurants,
  ] = useState<
    SuperAdminRestaurant[]
  >([]);

  const [
    selectedRestaurantId,
    setSelectedRestaurantId,
  ] = useState<string | null>(
    null
  );

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
    activeAction,
    setActiveAction,
  ] = useState<ActionKey>(
    null
  );

  const fetchData =
    useCallback(async () => {
      if (!accessToken) {
        throw new Error(
          "No existe una sesión activa."
        );
      }

      const [
        usersResult,
        restaurantsResult,
      ] = await Promise.all([
        getSuperAdminUsers(
          accessToken
        ),

        getSuperAdminRestaurants(
          accessToken
        ),
      ]);

      const foundUser =
        usersResult.find(
          (item) =>
            item.id === userId
        );

      if (!foundUser) {
        throw new Error(
          "El usuario seleccionado ya no existe."
        );
      }

      setUser(foundUser);

      setRestaurants(
        restaurantsResult
      );

      setSelectedRestaurantId(
        foundUser.restaurantId
      );
    }, [
      accessToken,
      userId,
    ]);

  const loadInitialData =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        await fetchData();
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
      }
    }, [fetchData]);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  const handleRefresh =
    useCallback(async () => {
      try {
        setRefreshing(true);
        setError(null);

        await fetchData();
      } catch (
        refreshError: unknown
      ) {
        setError(
          readErrorMessage(
            refreshError
          )
        );
      } finally {
        setRefreshing(false);
      }
    }, [fetchData]);

  const selectableRestaurants =
    useMemo(() => {
      return restaurants.filter(
        (restaurant) =>
          restaurant.isActive ||
          restaurant.id ===
            user?.restaurantId
      );
    }, [
      restaurants,
      user?.restaurantId,
    ]);

  const executeAction =
    useCallback(
      async (
        action: Exclude<
          ActionKey,
          null
        >,
        operation: () =>
          Promise<unknown>,
        successMessage: string
      ) => {
        if (activeAction) {
          return;
        }

        try {
          setActiveAction(
            action
          );

          await operation();

          await fetchData();

          Alert.alert(
            "Cambio realizado",
            successMessage
          );
        } catch (
          actionError: unknown
        ) {
          Alert.alert(
            "No se pudo realizar el cambio",
            readErrorMessage(
              actionError
            )
          );
        } finally {
          setActiveAction(
            null
          );
        }
      },
      [
        activeAction,
        fetchData,
      ]
    );

  const handleChangeToStudent =
    () => {
      if (
        !accessToken ||
        !user
      ) {
        return;
      }

      if (
        user.role === "STUDENT"
      ) {
        return;
      }

      Alert.alert(
        "Cambiar a estudiante",
        "El usuario dejará de ser manager y se eliminará su restaurante asignado.",
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text:
              "Cambiar rol",
            onPress: () => {
              void executeAction(
                "student",
                () =>
                  changeUserRole(
                    accessToken,
                    user.id,
                    "STUDENT"
                  ),
                "El usuario ahora tiene el rol de estudiante."
              );
            },
          },
        ]
      );
    };

  const handleAssignManager =
    () => {
      if (
        !accessToken ||
        !user
      ) {
        return;
      }

      if (
        !selectedRestaurantId
      ) {
        Alert.alert(
          "Selecciona un restaurante",
          "Debes seleccionar el restaurante que administrará este usuario."
        );

        return;
      }

      const restaurant =
        restaurants.find(
          (item) =>
            item.id ===
            selectedRestaurantId
        );

      if (
        !restaurant ||
        !restaurant.isActive
      ) {
        Alert.alert(
          "Restaurante no disponible",
          "Solo puedes asignar un manager a un restaurante activo."
        );

        return;
      }

      Alert.alert(
        "Asignar como manager",
        `¿Deseas asignar a ${user.fullName} como manager de ${restaurant.name}?`,
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Asignar",
            onPress: () => {
              void executeAction(
                "manager",
                () =>
                  assignManager(
                    accessToken,
                    user.id,
                    restaurant.id
                  ),
                `El usuario fue asignado como manager de ${restaurant.name}.`
              );
            },
          },
        ]
      );
    };

  const handleChangeStatus =
    (
      status: SuperAdminUserStatus
    ) => {
      if (
        !accessToken ||
        !user ||
        user.status === status
      ) {
        return;
      }

      const statusLabel =
        STATUS_LABELS[status];

      const message =
        status === "ACTIVE"
          ? "El usuario podrá volver a iniciar sesión y utilizar el sistema."
          : status ===
              "INACTIVE"
            ? "El usuario no podrá iniciar sesión mientras permanezca inactivo."
            : "El usuario será suspendido y sus sesiones abiertas serán revocadas.";

      Alert.alert(
        `Cambiar estado a ${statusLabel}`,
        message,
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text:
              "Confirmar cambio",
            style:
              status ===
              "ACTIVE"
                ? "default"
                : "destructive",
            onPress: () => {
              void executeAction(
                status,
                () =>
                  changeUserStatus(
                    accessToken,
                    user.id,
                    status
                  ),
                `El estado del usuario ahora es ${statusLabel.toLowerCase()}.`
              );
            },
          },
        ]
      );
    };

  const isSuperAdminUser =
    user?.role ===
    "SUPER_ADMIN";

  return (
    <Screen
      style={styles.container}
    >
      <View
        style={
          styles.header
        }
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Regresar"
          onPress={() =>
            navigation.goBack()
          }
          style={({ pressed }) => [
            styles.backButton,
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
          <MaterialCommunityIcons
            name="arrow-left"
            size={22}
            color={
              theme.textPrimary
            }
          />
        </Pressable>

        <View
          style={
            styles.headerText
          }
        >
          <Text
            style={[
              styles.headerTitle,
              {
                color:
                  theme.textPrimary,
              },
            ]}
          >
            Detalle del usuario
          </Text>

          <Text
            style={[
              styles.headerSubtitle,
              {
                color:
                  theme.textSecondary,
              },
            ]}
          >
            Administra su rol y estado
          </Text>
        </View>
      </View>

      {loading ? (
        <LoadingState
          message="Cargando usuario..."
          style={
            styles.feedback
          }
        />
      ) : error ? (
        <ErrorMessage
          title="No se pudo cargar el usuario"
          message={error}
          onRetry={() => {
            void loadInitialData();
          }}
          style={
            styles.feedback
          }
        />
      ) : !user ? (
        <ErrorMessage
          title="Usuario no encontrado"
          message="No se encontró la información del usuario."
          onRetry={() => {
            void loadInitialData();
          }}
          style={
            styles.feedback
          }
        />
      ) : (
        <ScrollView
          style={
            styles.scroll
          }
          contentContainerStyle={
            styles.content
          }
          showsVerticalScrollIndicator={
            false
          }
          refreshControl={
            <RefreshControl
              refreshing={
                refreshing
              }
              onRefresh={() => {
                void handleRefresh();
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
            style={[
              styles.userCard,
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
                  styles.badges
                }
              >
                <RoleBadge
                  role={
                    user.role
                  }
                />

                <StatusBadge
                  status={
                    user.status
                  }
                />
              </View>
            </View>
          </View>

          <View
            style={[
              styles.informationCard,
              {
                backgroundColor:
                  theme.surfaceElevated,

                borderColor:
                  theme.border,
              },
            ]}
          >
            <InformationRow
              iconName="account-cog-outline"
              label="Rol actual"
              value={
                ROLE_LABELS[
                  user.role
                ]
              }
            />

            <View
              style={[
                styles.divider,
                {
                  backgroundColor:
                    theme.divider,
                },
              ]}
            />

            <InformationRow
              iconName="storefront-outline"
              label="Restaurante asignado"
              value={
                user.restaurantName ??
                "Sin restaurante"
              }
            />

            <View
              style={[
                styles.divider,
                {
                  backgroundColor:
                    theme.divider,
                },
              ]}
            />

            <InformationRow
              iconName="shield-check-outline"
              label="Estado"
              value={
                STATUS_LABELS[
                  user.status
                ]
              }
            />
          </View>

          {isSuperAdminUser ? (
            <View
              style={[
                styles.noticeCard,
                {
                  backgroundColor:
                    theme.warningSoft,

                  borderColor:
                    theme.warningBorder,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="shield-lock-outline"
                size={24}
                color={
                  theme.warning
                }
              />

              <View
                style={
                  styles.noticeText
                }
              >
                <Text
                  style={[
                    styles.noticeTitle,
                    {
                      color:
                        theme.warning,
                    },
                  ]}
                >
                  Cuenta protegida
                </Text>

                <Text
                  style={[
                    styles.noticeDescription,
                    {
                      color:
                        theme.textSecondary,
                    },
                  ]}
                >
                  No se puede modificar el rol ni el estado de una cuenta de superadministrador.
                </Text>
              </View>
            </View>
          ) : (
            <>
              <SectionTitle
                iconName="account-switch-outline"
                title="Administrar rol"
              />

              <View
                style={[
                  styles.sectionCard,
                  {
                    backgroundColor:
                      theme.surfaceElevated,

                    borderColor:
                      theme.border,
                  },
                ]}
              >
                <Pressable
                  accessibilityRole="button"
                  disabled={
                    Boolean(
                      activeAction
                    )
                  }
                  onPress={
                    handleChangeToStudent
                  }
                  style={({ pressed }) => [
                    styles.roleOption,
                    {
                      borderColor:
                        user.role ===
                        "STUDENT"
                          ? theme.primary
                          : theme.border,

                      backgroundColor:
                        user.role ===
                        "STUDENT"
                          ? theme.primaryFaint
                          : theme.surface,
                    },
                    pressed &&
                      styles.pressed,
                  ]}
                >
                  <View
                    style={[
                      styles.optionIcon,
                      {
                        backgroundColor:
                          theme.primaryFaint,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="school-outline"
                      size={22}
                      color={
                        theme.primary
                      }
                    />
                  </View>

                  <View
                    style={
                      styles.optionText
                    }
                  >
                    <Text
                      style={[
                        styles.optionTitle,
                        {
                          color:
                            theme.textPrimary,
                        },
                      ]}
                    >
                      Estudiante
                    </Text>

                    <Text
                      style={[
                        styles.optionDescription,
                        {
                          color:
                            theme.textSecondary,
                        },
                      ]}
                    >
                      Accede a restaurantes, reservas y pagos.
                    </Text>
                  </View>

                  {user.role ===
                  "STUDENT" ? (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={22}
                      color={
                        theme.primary
                      }
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={22}
                      color={
                        theme.textMuted
                      }
                    />
                  )}
                </Pressable>

                <Text
                  style={[
                    styles.restaurantLabel,
                    {
                      color:
                        theme.textPrimary,
                    },
                  ]}
                >
                  Restaurante para el manager
                </Text>

                <Text
                  style={[
                    styles.restaurantHelp,
                    {
                      color:
                        theme.textSecondary,
                    },
                  ]}
                >
                  Selecciona un restaurante activo antes de asignar el rol de manager.
                </Text>

                <View
                  style={
                    styles.restaurantList
                  }
                >
                  {selectableRestaurants.length ===
                  0 ? (
                    <View
                      style={[
                        styles.emptyRestaurants,
                        {
                          backgroundColor:
                            theme.surfaceSecondary,

                          borderColor:
                            theme.border,
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="store-off-outline"
                        size={23}
                        color={
                          theme.textMuted
                        }
                      />

                      <Text
                        style={[
                          styles.emptyRestaurantsText,
                          {
                            color:
                              theme.textSecondary,
                          },
                        ]}
                      >
                        No existen restaurantes activos.
                      </Text>
                    </View>
                  ) : (
                    selectableRestaurants.map(
                      (
                        restaurant
                      ) => {
                        const selected =
                          selectedRestaurantId ===
                          restaurant.id;

                        return (
                          <Pressable
                            key={
                              restaurant.id
                            }
                            accessibilityRole="radio"
                            accessibilityState={{
                              selected,
                              disabled:
                                !restaurant.isActive,
                            }}
                            disabled={
                              !restaurant.isActive ||
                              Boolean(
                                activeAction
                              )
                            }
                            onPress={() =>
                              setSelectedRestaurantId(
                                restaurant.id
                              )
                            }
                            style={({
                              pressed,
                            }) => [
                              styles.restaurantOption,
                              {
                                backgroundColor:
                                  selected
                                    ? theme.primaryFaint
                                    : theme.surface,

                                borderColor:
                                  selected
                                    ? theme.primary
                                    : theme.border,
                              },
                              pressed &&
                                styles.pressed,
                              !restaurant.isActive &&
                                styles.disabled,
                            ]}
                          >
                            <View
                              style={[
                                styles.restaurantIcon,
                                {
                                  backgroundColor:
                                    restaurant.isActive
                                      ? theme.successSoft
                                      : theme.neutralSoft,
                                },
                              ]}
                            >
                              <MaterialCommunityIcons
                                name="storefront-outline"
                                size={20}
                                color={
                                  restaurant.isActive
                                    ? theme.success
                                    : theme.neutral
                                }
                              />
                            </View>

                            <View
                              style={
                                styles.restaurantText
                              }
                            >
                              <Text
                                style={[
                                  styles.restaurantName,
                                  {
                                    color:
                                      theme.textPrimary,
                                  },
                                ]}
                              >
                                {restaurant.name}
                              </Text>

                              <Text
                                style={[
                                  styles.restaurantStatus,
                                  {
                                    color:
                                      restaurant.isActive
                                        ? theme.success
                                        : theme.textMuted,
                                  },
                                ]}
                              >
                                {restaurant.isActive
                                  ? "Activo"
                                  : "Inactivo"}
                              </Text>
                            </View>

                            <MaterialCommunityIcons
                              name={
                                selected
                                  ? "radiobox-marked"
                                  : "radiobox-blank"
                              }
                              size={22}
                              color={
                                selected
                                  ? theme.primary
                                  : theme.textMuted
                              }
                            />
                          </Pressable>
                        );
                      }
                    )
                  )}
                </View>

                <Pressable
                  accessibilityRole="button"
                  disabled={
                    !selectedRestaurantId ||
                    Boolean(
                      activeAction
                    )
                  }
                  onPress={
                    handleAssignManager
                  }
                  style={({ pressed }) => [
                    styles.primaryButton,
                    {
                      backgroundColor:
                        theme.primary,
                    },
                    pressed &&
                      styles.pressed,
                    (
                      !selectedRestaurantId ||
                      Boolean(
                        activeAction
                      )
                    ) &&
                      styles.disabled,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="account-tie-outline"
                    size={20}
                    color={
                      theme.textInverted
                    }
                  />

                  <Text
                    style={[
                      styles.primaryButtonText,
                      {
                        color:
                          theme.textInverted,
                      },
                    ]}
                  >
                    {activeAction ===
                    "manager"
                      ? "Asignando..."
                      : "Asignar como manager"}
                  </Text>
                </Pressable>
              </View>

              <SectionTitle
                iconName="account-check-outline"
                title="Estado del usuario"
              />

              <View
                style={
                  styles.statusList
                }
              >
                <StatusOption
                  status="ACTIVE"
                  currentStatus={
                    user.status
                  }
                  disabled={
                    Boolean(
                      activeAction
                    )
                  }
                  loading={
                    activeAction ===
                    "ACTIVE"
                  }
                  onPress={
                    handleChangeStatus
                  }
                />

                <StatusOption
                  status="INACTIVE"
                  currentStatus={
                    user.status
                  }
                  disabled={
                    Boolean(
                      activeAction
                    )
                  }
                  loading={
                    activeAction ===
                    "INACTIVE"
                  }
                  onPress={
                    handleChangeStatus
                  }
                />

                <StatusOption
                  status="SUSPENDED"
                  currentStatus={
                    user.status
                  }
                  disabled={
                    Boolean(
                      activeAction
                    )
                  }
                  loading={
                    activeAction ===
                    "SUSPENDED"
                  }
                  onPress={
                    handleChangeStatus
                  }
                />
              </View>
            </>
          )}
        </ScrollView>
      )}
    </Screen>
  );
}

function SectionTitle({
  iconName,
  title,
}: {
  iconName: React.ComponentProps<
    typeof MaterialCommunityIcons
  >["name"];
  title: string;
}) {
  const theme = useThemeColors();

  return (
    <View
      style={
        styles.sectionTitleRow
      }
    >
      <View
        style={[
          styles.sectionTitleIcon,
          {
            backgroundColor:
              theme.primaryFaint,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={iconName}
          size={20}
          color={
            theme.primary
          }
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

function InformationRow({
  iconName,
  label,
  value,
}: {
  iconName: React.ComponentProps<
    typeof MaterialCommunityIcons
  >["name"];
  label: string;
  value: string;
}) {
  const theme = useThemeColors();

  return (
    <View
      style={
        styles.informationRow
      }
    >
      <View
        style={[
          styles.informationIcon,
          {
            backgroundColor:
              theme.primaryFaint,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={iconName}
          size={19}
          color={
            theme.primary
          }
        />
      </View>

      <View
        style={
          styles.informationText
        }
      >
        <Text
          style={[
            styles.informationLabel,
            {
              color:
                theme.textMuted,
            },
          ]}
        >
          {label}
        </Text>

        <Text
          style={[
            styles.informationValue,
            {
              color:
                theme.textPrimary,
            },
          ]}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function RoleBadge({
  role,
}: {
  role:
    SuperAdminUser["role"];
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
        name={
          role === "SUPER_ADMIN"
            ? "shield-account-outline"
            : role === "MANAGER"
              ? "account-tie-outline"
              : "school-outline"
        }
        size={14}
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
        {ROLE_LABELS[role]}
      </Text>
    </View>
  );
}

function StatusBadge({
  status,
}: {
  status:
    SuperAdminUserStatus;
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
        name={
          status === "ACTIVE"
            ? "check-circle-outline"
            : status ===
                "SUSPENDED"
              ? "alert-circle-outline"
              : "pause-circle-outline"
        }
        size={14}
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
        {STATUS_LABELS[status]}
      </Text>
    </View>
  );
}

function StatusOption({
  status,
  currentStatus,
  disabled,
  loading,
  onPress,
}: {
  status: SuperAdminUserStatus;
  currentStatus:
    SuperAdminUserStatus;
  disabled: boolean;
  loading: boolean;
  onPress: (
    status: SuperAdminUserStatus
  ) => void;
}) {
  const theme = useThemeColors();

  const selected =
    status === currentStatus;

  const configuration = {
    ACTIVE: {
      title: "Activo",
      description:
        "Puede iniciar sesión y utilizar el sistema.",
      iconName:
        "account-check-outline" as const,
      color: theme.success,
      backgroundColor:
        theme.successSoft,
      borderColor:
        theme.successBorder,
    },

    INACTIVE: {
      title: "Inactivo",
      description:
        "No puede iniciar sesión temporalmente.",
      iconName:
        "account-off-outline" as const,
      color: theme.warning,
      backgroundColor:
        theme.warningSoft,
      borderColor:
        theme.warningBorder,
    },

    SUSPENDED: {
      title: "Suspendido",
      description:
        "Acceso bloqueado y sesiones revocadas.",
      iconName:
        "account-alert-outline" as const,
      color: theme.danger,
      backgroundColor:
        theme.dangerSoft,
      borderColor:
        theme.dangerBorder,
    },
  }[status];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{
        selected,
        disabled,
      }}
      disabled={
        disabled ||
        selected
      }
      onPress={() =>
        onPress(status)
      }
      style={({ pressed }) => [
        styles.statusOption,
        {
          backgroundColor:
            selected
              ? configuration.backgroundColor
              : theme.surfaceElevated,

          borderColor:
            selected
              ? configuration.color
              : theme.border,
        },
        pressed &&
          styles.pressed,
        disabled &&
          !selected &&
          styles.disabled,
      ]}
    >
      <View
        style={[
          styles.statusIcon,
          {
            backgroundColor:
              configuration.backgroundColor,

            borderColor:
              configuration.borderColor,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={
            configuration.iconName
          }
          size={23}
          color={
            configuration.color
          }
        />
      </View>

      <View
        style={
          styles.statusText
        }
      >
        <Text
          style={[
            styles.statusTitle,
            {
              color:
                theme.textPrimary,
            },
          ]}
        >
          {configuration.title}
        </Text>

        <Text
          style={[
            styles.statusDescription,
            {
              color:
                theme.textSecondary,
            },
          ]}
        >
          {loading
            ? "Actualizando estado..."
            : configuration.description}
        </Text>
      </View>

      <MaterialCommunityIcons
        name={
          selected
            ? "check-circle"
            : "chevron-right"
        }
        size={23}
        color={
          selected
            ? configuration.color
            : theme.textMuted
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

    header: {
      minHeight: 58,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      marginBottom: spacing.md,
    },

    backButton: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      borderRadius:
        designSystem.radii.pill,
      borderWidth: 1,
    },

    headerText: {
      flex: 1,
      minWidth: 0,
    },

    headerTitle: {
      fontSize:
        typography.sizes.xl,
      lineHeight:
        typography.lineHeights.xl,
      fontWeight:
        typography.weights.bold,
    },

    headerSubtitle: {
      marginTop: 1,
      fontSize:
        typography.sizes.sm,
      lineHeight:
        typography.lineHeights.sm,
    },

    feedback: {
      flex: 1,
      justifyContent:
        "center",
    },

    scroll: {
      flex: 1,
    },

    content: {
      gap: spacing.lg,
      paddingBottom:
        spacing.xxxl,
    },

    userCard: {
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
      width: 66,
      height: 66,
      alignItems: "center",
      justifyContent: "center",
      borderRadius:
        designSystem.radii.pill,
      borderWidth: 1,
    },

    avatarText: {
      fontSize:
        typography.sizes.xl,
      lineHeight:
        typography.lineHeights.xl,
      fontWeight:
        typography.weights.extraBold,
    },

    userInformation: {
      flex: 1,
      minWidth: 0,
    },

    userName: {
      fontSize:
        typography.sizes.lg,
      lineHeight:
        typography.lineHeights.lg,
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

    badges: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.xs,
      marginTop: spacing.sm,
    },

    badge: {
      minHeight: 27,
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
      fontSize:
        typography.sizes.xs,
      lineHeight:
        typography.lineHeights.xs,
      fontWeight:
        typography.weights.bold,
    },

    informationCard: {
      paddingHorizontal:
        spacing.md,
      borderRadius:
        designSystem.radii.xl,
      borderWidth: 1,
      ...designSystem.shadows.low,
    },

    informationRow: {
      minHeight: 66,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      paddingVertical:
        spacing.sm,
    },

    informationIcon: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      borderRadius:
        designSystem.radii.pill,
    },

    informationText: {
      flex: 1,
      minWidth: 0,
    },

    informationLabel: {
      fontSize:
        typography.sizes.xs,
      lineHeight:
        typography.lineHeights.xs,
      fontWeight:
        typography.weights.semiBold,
    },

    informationValue: {
      marginTop: 2,
      fontSize:
        typography.sizes.sm,
      lineHeight:
        typography.lineHeights.sm,
      fontWeight:
        typography.weights.bold,
    },

    divider: {
      height: 1,
    },

    noticeCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.md,
      padding: spacing.lg,
      borderRadius:
        designSystem.radii.xl,
      borderWidth: 1,
    },

    noticeText: {
      flex: 1,
      minWidth: 0,
    },

    noticeTitle: {
      fontSize:
        typography.sizes.md,
      lineHeight:
        typography.lineHeights.md,
      fontWeight:
        typography.weights.bold,
    },

    noticeDescription: {
      marginTop: spacing.xs,
      fontSize:
        typography.sizes.sm,
      lineHeight:
        typography.lineHeights.sm,
    },

    sectionTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginTop: spacing.xs,
    },

    sectionTitleIcon: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
      borderRadius:
        designSystem.radii.pill,
    },

    sectionTitle: {
      flex: 1,
      fontSize:
        typography.sizes.lg,
      lineHeight:
        typography.lineHeights.lg,
      fontWeight:
        typography.weights.bold,
    },

    sectionCard: {
      gap: spacing.md,
      padding: spacing.lg,
      borderRadius:
        designSystem.radii.xl,
      borderWidth: 1,
      ...designSystem.shadows.low,
    },

    roleOption: {
      minHeight: 78,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      padding: spacing.md,
      borderRadius:
        designSystem.radii.lg,
      borderWidth: 1,
    },

    optionIcon: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      borderRadius:
        designSystem.radii.pill,
    },

    optionText: {
      flex: 1,
      minWidth: 0,
    },

    optionTitle: {
      fontSize:
        typography.sizes.md,
      lineHeight:
        typography.lineHeights.md,
      fontWeight:
        typography.weights.bold,
    },

    optionDescription: {
      marginTop: 2,
      fontSize:
        typography.sizes.xs,
      lineHeight:
        typography.lineHeights.xs,
    },

    restaurantLabel: {
      marginTop: spacing.xs,
      fontSize:
        typography.sizes.md,
      lineHeight:
        typography.lineHeights.md,
      fontWeight:
        typography.weights.bold,
    },

    restaurantHelp: {
      marginTop:
        -spacing.sm,
      fontSize:
        typography.sizes.xs,
      lineHeight:
        typography.lineHeights.xs,
    },

    restaurantList: {
      gap: spacing.sm,
    },

    restaurantOption: {
      minHeight: 66,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      padding: spacing.md,
      borderRadius:
        designSystem.radii.lg,
      borderWidth: 1,
    },

    restaurantIcon: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      borderRadius:
        designSystem.radii.pill,
    },

    restaurantText: {
      flex: 1,
      minWidth: 0,
    },

    restaurantName: {
      fontSize:
        typography.sizes.sm,
      lineHeight:
        typography.lineHeights.sm,
      fontWeight:
        typography.weights.bold,
    },

    restaurantStatus: {
      marginTop: 2,
      fontSize:
        typography.sizes.xs,
      lineHeight:
        typography.lineHeights.xs,
      fontWeight:
        typography.weights.semiBold,
    },

    emptyRestaurants: {
      minHeight: 70,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius:
        designSystem.radii.lg,
      borderWidth: 1,
      borderStyle: "dashed",
    },

    emptyRestaurantsText: {
      flex: 1,
      fontSize:
        typography.sizes.sm,
      lineHeight:
        typography.lineHeights.sm,
    },

    primaryButton: {
      minHeight: 50,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      paddingHorizontal:
        spacing.lg,
      borderRadius:
        designSystem.radii.button,
    },

    primaryButtonText: {
      fontSize:
        typography.sizes.sm,
      lineHeight:
        typography.lineHeights.sm,
      fontWeight:
        typography.weights.bold,
    },

    statusList: {
      gap: spacing.sm,
    },

    statusOption: {
      minHeight: 82,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      padding: spacing.md,
      borderRadius:
        designSystem.radii.xl,
      borderWidth: 1,
      ...designSystem.shadows.low,
    },

    statusIcon: {
      width: 46,
      height: 46,
      alignItems: "center",
      justifyContent: "center",
      borderRadius:
        designSystem.radii.pill,
      borderWidth: 1,
    },

    statusText: {
      flex: 1,
      minWidth: 0,
    },

    statusTitle: {
      fontSize:
        typography.sizes.md,
      lineHeight:
        typography.lineHeights.md,
      fontWeight:
        typography.weights.bold,
    },

    statusDescription: {
      marginTop: 2,
      fontSize:
        typography.sizes.xs,
      lineHeight:
        typography.lineHeights.xs,
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