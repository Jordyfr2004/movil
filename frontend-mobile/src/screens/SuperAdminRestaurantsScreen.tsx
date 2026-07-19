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
  TextInput,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import {
  ErrorMessage,
  LoadingState,
  Screen,
} from "../components";
import { spacing } from "../constants/spacing";
import { useAuth } from "../context/AuthContext";
import { useThemeColors } from "../hooks/useThemeColors";
import {
  createSuperAdminRestaurant,
  getSuperAdminRestaurants,
  SuperAdminRestaurant,
  updateSuperAdminRestaurantName,
  updateSuperAdminRestaurantStatus,
} from "../services/superAdminService";
import {
  designSystem,
  typography,
} from "../theme";

type RestaurantFilter =
  | "ALL"
  | "ACTIVE"
  | "INACTIVE";

const FILTERS: {
  key: RestaurantFilter;
  label: string;
}[] = [
  {
    key: "ALL",
    label: "Todos",
  },
  {
    key: "ACTIVE",
    label: "Activos",
  },
  {
    key: "INACTIVE",
    label: "Inactivos",
  },
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

  return "No se pudo completar la operación.";
}

function getShortId(
  restaurantId: string
): string {
  if (
    restaurantId.length <= 18
  ) {
    return restaurantId;
  }

  return `${restaurantId.slice(
    0,
    8
  )}...${restaurantId.slice(-5)}`;
}

export function SuperAdminRestaurantsScreen() {
  const theme = useThemeColors();
  const { accessToken } = useAuth();

  const [
    restaurants,
    setRestaurants,
  ] = useState<
    SuperAdminRestaurant[]
  >([]);

  const [
    searchText,
    setSearchText,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<RestaurantFilter>(
      "ALL"
    );

  const [
    showCreateForm,
    setShowCreateForm,
  ] = useState(false);

  const [
    newName,
    setNewName,
  ] = useState("");

  const [
    editingId,
    setEditingId,
  ] = useState<string | null>(
    null
  );

  const [
    editName,
    setEditName,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    creating,
    setCreating,
  ] = useState(false);

  const [
    processingId,
    setProcessingId,
  ] = useState<string | null>(
    null
  );

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  const loadRestaurants =
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

          const result =
            await getSuperAdminRestaurants(
              accessToken
            );

          setRestaurants(result);
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
    void loadRestaurants();
  }, [loadRestaurants]);

  const activeRestaurants =
    useMemo(
      () =>
        restaurants.filter(
          (restaurant) =>
            restaurant.isActive
        ).length,
      [restaurants]
    );

  const inactiveRestaurants =
    restaurants.length -
    activeRestaurants;

  const filteredRestaurants =
    useMemo(() => {
      const normalizedSearch =
        searchText
          .trim()
          .toLowerCase();

      return restaurants.filter(
        (restaurant) => {
          const matchesSearch =
            !normalizedSearch ||
            restaurant.name
              .toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            restaurant.id
              .toLowerCase()
              .includes(
                normalizedSearch
              );

          const matchesStatus =
            statusFilter === "ALL" ||
            (
              statusFilter ===
                "ACTIVE" &&
              restaurant.isActive
            ) ||
            (
              statusFilter ===
                "INACTIVE" &&
              !restaurant.isActive
            );

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      restaurants,
      searchText,
      statusFilter,
    ]);

  const hasActiveFilters =
    searchText.trim().length > 0 ||
    statusFilter !== "ALL";

  const clearFilters = () => {
    setSearchText("");
    setStatusFilter("ALL");
  };

  const closeCreateForm = () => {
    if (creating) {
      return;
    }

    setShowCreateForm(false);
    setNewName("");
  };

  const handleCreateRestaurant =
    async () => {
      if (
        !accessToken ||
        creating
      ) {
        return;
      }

      const name =
        newName.trim();

      if (!name) {
        Alert.alert(
          "Nombre requerido",
          "Ingresa el nombre del restaurante."
        );

        return;
      }

      try {
        setCreating(true);

        await createSuperAdminRestaurant(
          accessToken,
          {
            name,
            is_active: true,
          }
        );

        setNewName("");
        setShowCreateForm(false);

        await loadRestaurants(
          "refresh"
        );

        Alert.alert(
          "Restaurante creado",
          "El restaurante fue creado y quedó activo."
        );
      } catch (
        createError: unknown
      ) {
        Alert.alert(
          "No se pudo crear",
          readErrorMessage(
            createError
          )
        );
      } finally {
        setCreating(false);
      }
    };

  const startEditing = (
    restaurant: SuperAdminRestaurant
  ) => {
    if (processingId) {
      return;
    }

    setEditingId(
      restaurant.id
    );

    setEditName(
      restaurant.name
    );
  };

  const cancelEditing = () => {
    if (processingId) {
      return;
    }

    setEditingId(null);
    setEditName("");
  };

  const handleSaveName =
    async (
      restaurant: SuperAdminRestaurant
    ) => {
      if (
        !accessToken ||
        processingId
      ) {
        return;
      }

      const name =
        editName.trim();

      if (!name) {
        Alert.alert(
          "Nombre requerido",
          "Ingresa el nuevo nombre del restaurante."
        );

        return;
      }

      if (
        name === restaurant.name
      ) {
        cancelEditing();
        return;
      }

      try {
        setProcessingId(
          restaurant.id
        );

        await updateSuperAdminRestaurantName(
          accessToken,
          restaurant.id,
          name
        );

        setEditingId(null);
        setEditName("");

        await loadRestaurants(
          "refresh"
        );

        Alert.alert(
          "Nombre actualizado",
          "El nombre del restaurante fue actualizado correctamente."
        );
      } catch (
        updateError: unknown
      ) {
        Alert.alert(
          "No se pudo actualizar",
          readErrorMessage(
            updateError
          )
        );
      } finally {
        setProcessingId(null);
      }
    };

  const confirmToggleStatus = (
    restaurant: SuperAdminRestaurant
  ) => {
    if (processingId) {
      return;
    }

    const nextStatus =
      !restaurant.isActive;

    Alert.alert(
      nextStatus
        ? "Activar restaurante"
        : "Desactivar restaurante",
      nextStatus
        ? `¿Deseas activar ${restaurant.name}?`
        : `¿Deseas desactivar ${restaurant.name}? Los usuarios no podrán utilizarlo mientras permanezca inactivo.`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: nextStatus
            ? "Activar"
            : "Desactivar",
          style: nextStatus
            ? "default"
            : "destructive",
          onPress: () => {
            void handleToggleStatus(
              restaurant
            );
          },
        },
      ]
    );
  };

  const handleToggleStatus =
    async (
      restaurant: SuperAdminRestaurant
    ) => {
      if (
        !accessToken ||
        processingId
      ) {
        return;
      }

      const nextStatus =
        !restaurant.isActive;

      try {
        setProcessingId(
          restaurant.id
        );

        await updateSuperAdminRestaurantStatus(
          accessToken,
          restaurant.id,
          nextStatus
        );

        await loadRestaurants(
          "refresh"
        );

        Alert.alert(
          nextStatus
            ? "Restaurante activado"
            : "Restaurante desactivado",
          nextStatus
            ? "El restaurante ya está disponible."
            : "El restaurante quedó inactivo."
        );
      } catch (
        statusError: unknown
      ) {
        Alert.alert(
          "No se pudo cambiar el estado",
          readErrorMessage(
            statusError
          )
        );
      } finally {
        setProcessingId(null);
      }
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
            refreshing={
              refreshing
            }
            onRefresh={() => {
              void loadRestaurants(
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
              Restaurantes
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
              Crea, edita y administra los restaurantes
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Actualizar restaurantes"
            disabled={
              loading ||
              refreshing
            }
            onPress={() => {
              void loadRestaurants(
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
            label="Total"
            value={
              restaurants.length
            }
            iconName="storefront-outline"
            tone="primary"
          />

          <SummaryCard
            label="Activos"
            value={
              activeRestaurants
            }
            iconName="store-check-outline"
            tone="success"
          />

          <SummaryCard
            label="Inactivos"
            value={
              inactiveRestaurants
            }
            iconName="store-off-outline"
            tone="warning"
          />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            showCreateForm
              ? "Cerrar formulario para crear restaurante"
              : "Crear nuevo restaurante"
          }
          disabled={creating}
          onPress={() => {
            if (showCreateForm) {
              closeCreateForm();
            } else {
              setShowCreateForm(
                true
              );
            }
          }}
          style={({ pressed }) => [
            styles.createToggleButton,
            {
              backgroundColor:
                theme.primary,

              borderColor:
                theme.primary,
            },
            pressed &&
              styles.pressed,
            creating &&
              styles.disabled,
          ]}
        >
          <View
            style={[
              styles.createToggleIcon,
              {
                backgroundColor:
                  theme.textInverted,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={
                showCreateForm
                  ? "close"
                  : "plus"
              }
              size={20}
              color={
                theme.primary
              }
            />
          </View>

          <View
            style={
              styles.createToggleText
            }
          >
            <Text
              style={[
                styles.createToggleTitle,
                {
                  color:
                    theme.textInverted,
                },
              ]}
            >
              {showCreateForm
                ? "Cancelar creación"
                : "Nuevo restaurante"}
            </Text>

            <Text
              style={[
                styles.createToggleSubtitle,
                {
                  color:
                    theme.textInverted,
                },
              ]}
            >
              {showCreateForm
                ? "Cerrar el formulario"
                : "Registrar un restaurante"}
            </Text>
          </View>

          <MaterialCommunityIcons
            name={
              showCreateForm
                ? "chevron-up"
                : "chevron-down"
            }
            size={22}
            color={
              theme.textInverted
            }
          />
        </Pressable>

        {showCreateForm ? (
          <View
            style={[
              styles.createCard,
              {
                backgroundColor:
                  theme.surfaceElevated,

                borderColor:
                  theme.border,
              },
            ]}
          >
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
                  name="store-plus-outline"
                  size={22}
                  color={
                    theme.primary
                  }
                />
              </View>

              <View
                style={
                  styles.sectionHeaderText
                }
              >
                <Text
                  style={[
                    styles.sectionTitle,
                    {
                      color:
                        theme.textPrimary,
                    },
                  ]}
                >
                  Crear restaurante
                </Text>

                <Text
                  style={[
                    styles.sectionDescription,
                    {
                      color:
                        theme.textSecondary,
                    },
                  ]}
                >
                  El nuevo restaurante se creará en estado activo.
                </Text>
              </View>
            </View>

            <View>
              <Text
                style={[
                  styles.inputLabel,
                  {
                    color:
                      theme.textPrimary,
                  },
                ]}
              >
                Nombre del restaurante
              </Text>

              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor:
                      theme.surface,

                    borderColor:
                      theme.border,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="storefront-outline"
                  size={20}
                  color={
                    theme.textMuted
                  }
                />

                <TextInput
                  value={newName}
                  onChangeText={
                    setNewName
                  }
                  placeholder="Ejemplo: Restaurante Central"
                  placeholderTextColor={
                    theme.textMuted
                  }
                  editable={!creating}
                  autoCapitalize="words"
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    void handleCreateRestaurant();
                  }}
                  style={[
                    styles.input,
                    {
                      color:
                        theme.textPrimary,
                    },
                  ]}
                />

                {newName.length > 0 ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Limpiar nombre"
                    disabled={creating}
                    onPress={() =>
                      setNewName("")
                    }
                    style={({
                      pressed,
                    }) => [
                      styles.clearInputButton,
                      pressed &&
                        styles.pressed,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="close-circle"
                      size={20}
                      color={
                        theme.textMuted
                      }
                    />
                  </Pressable>
                ) : null}
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              disabled={
                creating ||
                !newName.trim()
              }
              onPress={() => {
                void handleCreateRestaurant();
              }}
              style={({ pressed }) => [
                styles.primaryButton,
                {
                  backgroundColor:
                    theme.primary,
                },
                pressed &&
                  styles.pressed,
                (
                  creating ||
                  !newName.trim()
                ) &&
                  styles.disabled,
              ]}
            >
              <MaterialCommunityIcons
                name="plus-circle-outline"
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
                {creating
                  ? "Creando..."
                  : "Crear restaurante"}
              </Text>
            </Pressable>
          </View>
        ) : null}

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
            placeholder="Buscar por nombre o ID"
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
              style={({
                pressed,
              }) => [
                styles.clearInputButton,
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
              name="filter-variant"
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
              Filtrar por estado
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.filterRow
            }
          >
            {FILTERS.map(
              (filter) => (
                <FilterChip
                  key={filter.key}
                  label={
                    filter.label
                  }
                  selected={
                    statusFilter ===
                    filter.key
                  }
                  onPress={() =>
                    setStatusFilter(
                      filter.key
                    )
                  }
                />
              )
            )}
          </ScrollView>
        </View>

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
              Lista de restaurantes
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
              {
                filteredRestaurants.length
              }{" "}
              de{" "}
              {restaurants.length}
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
            message="Cargando restaurantes..."
            style={
              styles.feedback
            }
          />
        ) : error ? (
          <ErrorMessage
            title="No se pudieron cargar los restaurantes"
            message={error}
            onRetry={() => {
              void loadRestaurants();
            }}
            style={
              styles.feedback
            }
          />
        ) : filteredRestaurants.length ===
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
                name="store-search-outline"
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
              No se encontraron restaurantes
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
              {restaurants.length ===
              0
                ? "Crea el primer restaurante del sistema."
                : "Modifica la búsqueda o el filtro seleccionado."}
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
            ) : (
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  setShowCreateForm(
                    true
                  )
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
                  Crear restaurante
                </Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View
            style={
              styles.restaurantList
            }
          >
            {filteredRestaurants.map(
              (restaurant) => (
                <RestaurantCard
                  key={
                    restaurant.id
                  }
                  restaurant={
                    restaurant
                  }
                  editing={
                    editingId ===
                    restaurant.id
                  }
                  editName={
                    editingId ===
                    restaurant.id
                      ? editName
                      : restaurant.name
                  }
                  processing={
                    processingId ===
                    restaurant.id
                  }
                  disabled={
                    Boolean(
                      processingId
                    ) ||
                    creating
                  }
                  onEditNameChange={
                    setEditName
                  }
                  onStartEditing={() =>
                    startEditing(
                      restaurant
                    )
                  }
                  onCancelEditing={
                    cancelEditing
                  }
                  onSaveEditing={() => {
                    void handleSaveName(
                      restaurant
                    );
                  }}
                  onToggleStatus={() =>
                    confirmToggleStatus(
                      restaurant
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
    | "warning";
}) {
  const theme = useThemeColors();

  const color =
    tone === "success"
      ? theme.success
      : tone === "warning"
        ? theme.warning
        : theme.primary;

  const backgroundColor =
    tone === "success"
      ? theme.successSoft
      : tone === "warning"
        ? theme.warningSoft
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
            backgroundColor,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={iconName}
          size={21}
          color={color}
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

function RestaurantCard({
  restaurant,
  editing,
  editName,
  processing,
  disabled,
  onEditNameChange,
  onStartEditing,
  onCancelEditing,
  onSaveEditing,
  onToggleStatus,
}: {
  restaurant: SuperAdminRestaurant;
  editing: boolean;
  editName: string;
  processing: boolean;
  disabled: boolean;
  onEditNameChange: (
    value: string
  ) => void;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onSaveEditing: () => void;
  onToggleStatus: () => void;
}) {
  const theme = useThemeColors();

  return (
    <View
      style={[
        styles.restaurantCard,
        {
          backgroundColor:
            theme.surfaceElevated,

          borderColor:
            editing
              ? theme.primary
              : theme.border,
        },
      ]}
    >
      <View
        style={
          styles.restaurantMain
        }
      >
        <View
          style={[
            styles.restaurantIcon,
            {
              backgroundColor:
                restaurant.isActive
                  ? theme.successSoft
                  : theme.neutralSoft,

              borderColor:
                restaurant.isActive
                  ? theme.successBorder
                  : theme.neutralBorder,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={
              restaurant.isActive
                ? "storefront-outline"
                : "store-off-outline"
            }
            size={26}
            color={
              restaurant.isActive
                ? theme.success
                : theme.neutral
            }
          />
        </View>

        <View
          style={
            styles.restaurantInformation
          }
        >
          <Text
            numberOfLines={2}
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
            numberOfLines={1}
            style={[
              styles.restaurantId,
              {
                color:
                  theme.textMuted,
              },
            ]}
          >
            ID:{" "}
            {getShortId(
              restaurant.id
            )}
          </Text>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  restaurant.isActive
                    ? theme.successSoft
                    : theme.warningSoft,

                borderColor:
                  restaurant.isActive
                    ? theme.successBorder
                    : theme.warningBorder,
              },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    restaurant.isActive
                      ? theme.success
                      : theme.warning,
                },
              ]}
            />

            <Text
              style={[
                styles.statusBadgeText,
                {
                  color:
                    restaurant.isActive
                      ? theme.success
                      : theme.warning,
                },
              ]}
            >
              {restaurant.isActive
                ? "Activo"
                : "Inactivo"}
            </Text>
          </View>
        </View>
      </View>

      {editing ? (
        <View
          style={[
            styles.editSection,
            {
              borderTopColor:
                theme.divider,
            },
          ]}
        >
          <Text
            style={[
              styles.inputLabel,
              {
                color:
                  theme.textPrimary,
              },
            ]}
          >
            Nuevo nombre
          </Text>

          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor:
                  theme.surface,

                borderColor:
                  theme.primary,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="pencil-outline"
              size={20}
              color={
                theme.primary
              }
            />

            <TextInput
              value={editName}
              onChangeText={
                onEditNameChange
              }
              editable={!processing}
              autoFocus
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={
                onSaveEditing
              }
              style={[
                styles.input,
                {
                  color:
                    theme.textPrimary,
                },
              ]}
            />
          </View>

          <View
            style={
              styles.editActions
            }
          >
            <Pressable
              accessibilityRole="button"
              disabled={processing}
              onPress={
                onCancelEditing
              }
              style={({ pressed }) => [
                styles.secondaryActionButton,
                {
                  backgroundColor:
                    theme.surface,

                  borderColor:
                    theme.border,
                },
                pressed &&
                  styles.pressed,
                processing &&
                  styles.disabled,
              ]}
            >
              <MaterialCommunityIcons
                name="close"
                size={18}
                color={
                  theme.textSecondary
                }
              />

              <Text
                style={[
                  styles.secondaryActionText,
                  {
                    color:
                      theme.textSecondary,
                  },
                ]}
              >
                Cancelar
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={
                processing ||
                !editName.trim()
              }
              onPress={
                onSaveEditing
              }
              style={({ pressed }) => [
                styles.saveButton,
                {
                  backgroundColor:
                    theme.primary,
                },
                pressed &&
                  styles.pressed,
                (
                  processing ||
                  !editName.trim()
                ) &&
                  styles.disabled,
              ]}
            >
              <MaterialCommunityIcons
                name="content-save-outline"
                size={18}
                color={
                  theme.textInverted
                }
              />

              <Text
                style={[
                  styles.saveButtonText,
                  {
                    color:
                      theme.textInverted,
                  },
                ]}
              >
                {processing
                  ? "Guardando..."
                  : "Guardar"}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View
          style={[
            styles.cardActions,
            {
              borderTopColor:
                theme.divider,
            },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Editar ${restaurant.name}`}
            disabled={disabled}
            onPress={
              onStartEditing
            }
            style={({ pressed }) => [
              styles.editButton,
              {
                backgroundColor:
                  theme.primaryFaint,

                borderColor:
                  theme.primarySoft,
              },
              pressed &&
                styles.pressed,
              disabled &&
                styles.disabled,
            ]}
          >
            <MaterialCommunityIcons
              name="pencil-outline"
              size={18}
              color={
                theme.primary
              }
            />

            <Text
              style={[
                styles.editButtonText,
                {
                  color:
                    theme.primary,
                },
              ]}
            >
              Editar
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              restaurant.isActive
                ? `Desactivar ${restaurant.name}`
                : `Activar ${restaurant.name}`
            }
            disabled={disabled}
            onPress={
              onToggleStatus
            }
            style={({ pressed }) => [
              styles.statusButton,
              {
                backgroundColor:
                  restaurant.isActive
                    ? theme.dangerSoft
                    : theme.successSoft,

                borderColor:
                  restaurant.isActive
                    ? theme.dangerBorder
                    : theme.successBorder,
              },
              pressed &&
                styles.pressed,
              disabled &&
                styles.disabled,
            ]}
          >
            <MaterialCommunityIcons
              name="power"
              size={18}
              color={
                restaurant.isActive
                  ? theme.danger
                  : theme.success
              }
            />

            <Text
              style={[
                styles.statusButtonText,
                {
                  color:
                    restaurant.isActive
                      ? theme.danger
                      : theme.success,
                },
              ]}
            >
              {processing
                ? "Procesando..."
                : restaurant.isActive
                  ? "Desactivar"
                  : "Activar"}
            </Text>
          </Pressable>
        </View>
      )}
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

    createToggleButton: {
      minHeight: 72,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      paddingHorizontal:
        spacing.md,
      borderRadius:
        designSystem.radii.xl,
      borderWidth: 1,
      ...designSystem.shadows.medium,
    },

    createToggleIcon: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      borderRadius:
        designSystem.radii.pill,
    },

    createToggleText: {
      flex: 1,
      minWidth: 0,
    },

    createToggleTitle: {
      fontSize:
        typography.sizes.md,
      lineHeight:
        typography.lineHeights.md,
      fontWeight:
        typography.weights.bold,
    },

    createToggleSubtitle: {
      marginTop: 1,
      fontSize:
        typography.sizes.xs,
      lineHeight:
        typography.lineHeights.xs,
      opacity: 0.9,
    },

    createCard: {
      gap: spacing.lg,
      padding: spacing.lg,
      borderRadius:
        designSystem.radii.xl,
      borderWidth: 1,
      ...designSystem.shadows.low,
    },

    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
    },

    sectionIcon: {
      width: 46,
      height: 46,
      alignItems: "center",
      justifyContent: "center",
      borderRadius:
        designSystem.radii.pill,
    },

    sectionHeaderText: {
      flex: 1,
      minWidth: 0,
    },

    sectionTitle: {
      fontSize:
        typography.sizes.lg,
      lineHeight:
        typography.lineHeights.lg,
      fontWeight:
        typography.weights.bold,
    },

    sectionDescription: {
      marginTop: 2,
      fontSize:
        typography.sizes.xs,
      lineHeight:
        typography.lineHeights.xs,
    },

    inputLabel: {
      marginBottom: spacing.sm,
      fontSize:
        typography.sizes.sm,
      lineHeight:
        typography.lineHeights.sm,
      fontWeight:
        typography.weights.bold,
    },

    inputContainer: {
      minHeight: 52,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingHorizontal:
        spacing.md,
      borderRadius:
        designSystem.radii.input,
      borderWidth: 1,
    },

    input: {
      flex: 1,
      minWidth: 0,
      paddingVertical:
        spacing.sm,
      fontSize:
        typography.sizes.sm,
      lineHeight:
        typography.lineHeights.sm,
    },

    clearInputButton: {
      width: 34,
      height: 34,
      alignItems: "center",
      justifyContent: "center",
      borderRadius:
        designSystem.radii.pill,
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

    searchContainer: {
      minHeight: 52,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingHorizontal:
        spacing.md,
      borderRadius:
        designSystem.radii.input,
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

    restaurantList: {
      gap: spacing.md,
    },

    restaurantCard: {
      overflow: "hidden",
      borderRadius:
        designSystem.radii.xl,
      borderWidth: 1,
      ...designSystem.shadows.low,
    },

    restaurantMain: {
      minHeight: 112,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      padding: spacing.md,
    },

    restaurantIcon: {
      width: 58,
      height: 58,
      alignItems: "center",
      justifyContent: "center",
      borderRadius:
        designSystem.radii.lg,
      borderWidth: 1,
    },

    restaurantInformation: {
      flex: 1,
      minWidth: 0,
    },

    restaurantName: {
      fontSize:
        typography.sizes.md,
      lineHeight:
        typography.lineHeights.md,
      fontWeight:
        typography.weights.bold,
    },

    restaurantId: {
      marginTop: 2,
      fontSize:
        typography.sizes.xs,
      lineHeight:
        typography.lineHeights.xs,
    },

    statusBadge: {
      alignSelf: "flex-start",
      minHeight: 27,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      marginTop: spacing.sm,
      paddingHorizontal:
        spacing.sm,
      borderRadius:
        designSystem.radii.pill,
      borderWidth: 1,
    },

    statusDot: {
      width: 7,
      height: 7,
      borderRadius:
        designSystem.radii.pill,
    },

    statusBadgeText: {
      fontSize:
        typography.sizes.xs,
      lineHeight:
        typography.lineHeights.xs,
      fontWeight:
        typography.weights.bold,
    },

    cardActions: {
      minHeight: 62,
      flexDirection: "row",
      gap: spacing.sm,
      padding: spacing.md,
      borderTopWidth: 1,
    },

    editButton: {
      flex: 1,
      minHeight: 42,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xs,
      borderRadius:
        designSystem.radii.button,
      borderWidth: 1,
    },

    editButtonText: {
      fontSize:
        typography.sizes.xs,
      lineHeight:
        typography.lineHeights.xs,
      fontWeight:
        typography.weights.bold,
    },

    statusButton: {
      flex: 1,
      minHeight: 42,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xs,
      borderRadius:
        designSystem.radii.button,
      borderWidth: 1,
    },

    statusButtonText: {
      fontSize:
        typography.sizes.xs,
      lineHeight:
        typography.lineHeights.xs,
      fontWeight:
        typography.weights.bold,
    },

    editSection: {
      gap: spacing.md,
      padding: spacing.md,
      borderTopWidth: 1,
    },

    editActions: {
      flexDirection: "row",
      gap: spacing.sm,
    },

    secondaryActionButton: {
      flex: 1,
      minHeight: 42,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xs,
      borderRadius:
        designSystem.radii.button,
      borderWidth: 1,
    },

    secondaryActionText: {
      fontSize:
        typography.sizes.xs,
      lineHeight:
        typography.lineHeights.xs,
      fontWeight:
        typography.weights.bold,
    },

    saveButton: {
      flex: 1,
      minHeight: 42,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xs,
      borderRadius:
        designSystem.radii.button,
    },

    saveButtonText: {
      fontSize:
        typography.sizes.xs,
      lineHeight:
        typography.lineHeights.xs,
      fontWeight:
        typography.weights.bold,
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