import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import Svg, { Path } from "react-native-svg";

import {
  ManagerDishCard,
  ManagerDishesFeedback,
  ManagerProfileListHeader,
} from "../components/managerProfile";
import { Screen } from "../components/Screen";
import { spacing } from "../constants/spacing";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../navigation/routes";
import { RootStackParamList } from "../navigation/types";
import {
  deleteDish,
  Dish,
  getManagerDishes,
  updateDish,
} from "../services/dishService";
import {
  getRestaurantById,
  uploadMyRestaurantImage,
} from "../services/restaurantService";
import {
  getProfileBestEffort,
  UserProfile,
} from "../services/userService";
import { studentPalette } from "../theme/studentPalette";

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.ManagerProfile
>;

function createImageFileName(
  originalFileName: string | null | undefined,
  mimeType: string
): string {
  if (
    originalFileName &&
    originalFileName.trim()
  ) {
    return originalFileName;
  }

  if (mimeType === "image/png") {
    return `restaurant-${Date.now()}.png`;
  }

  if (mimeType === "image/webp") {
    return `restaurant-${Date.now()}.webp`;
  }

  return `restaurant-${Date.now()}.jpg`;
}

function addCacheVersion(
  imageUrl: string
): string {
  const separator =
    imageUrl.includes("?")
      ? "&"
      : "?";

  return `${imageUrl}${separator}v=${Date.now()}`;
}

function getErrorMessage(
  error: unknown,
  fallback: string
): string {
  return error instanceof Error
    ? error.message
    : fallback;
}

export function ManagerProfileScreen({
  navigation,
}: Props) {
  const {
    accessToken,
    user,
  } = useAuth();

  const [
    isLoadingDishes,
    setIsLoadingDishes,
  ] = useState(false);

  const [
    dishes,
    setDishes,
  ] = useState<Dish[]>([]);

  const [
    removingDishId,
    setRemovingDishId,
  ] = useState<string | null>(null);

  const [
    togglingDishId,
    setTogglingDishId,
  ] = useState<string | null>(null);

  const [
    profile,
    setProfile,
  ] = useState<UserProfile | null>(null);

  const [
    restaurantName,
    setRestaurantName,
  ] = useState("");

  const [
    restaurantImageUrl,
    setRestaurantImageUrl,
  ] = useState<string | null>(null);

  const [
    isUploadingRestaurantImage,
    setIsUploadingRestaurantImage,
  ] = useState(false);

  const [
    dishesError,
    setDishesError,
  ] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadProfile = async () => {
      if (!accessToken) {
        if (isActive) {
          setProfile(null);
          setRestaurantName("");
          setRestaurantImageUrl(null);
        }

        return;
      }

      try {
        const data =
          await getProfileBestEffort(
            accessToken,
            user?.user_id
          );

        if (!isActive) {
          return;
        }

        setProfile(data);

        const restaurantId =
          data?.restaurantId;

        if (!restaurantId) {
          setRestaurantName("");
          setRestaurantImageUrl(null);
          return;
        }

        const restaurant =
          await getRestaurantById(
            String(restaurantId)
          );

        if (!isActive) {
          return;
        }

        setRestaurantName(
          restaurant?.name ?? ""
        );

        setRestaurantImageUrl(
          restaurant?.imageUrl ?? null
        );
      } catch {
        if (isActive) {
          setProfile(null);
          setRestaurantName("");
          setRestaurantImageUrl(null);
        }
      }
    };

    void loadProfile();

    return () => {
      isActive = false;
    };
  }, [
    accessToken,
    user?.user_id,
  ]);

  const loadDishes =
    useCallback(async () => {
      if (!accessToken) {
        setDishes([]);
        setDishesError(null);
        return;
      }

      try {
        setIsLoadingDishes(true);

        const list =
          await getManagerDishes(
            accessToken
          );

        setDishes(list);
        setDishesError(null);
      } catch (error) {
        setDishes([]);

        setDishesError(
          getErrorMessage(
            error,
            "No se pudieron cargar los platos"
          )
        );
      } finally {
        setIsLoadingDishes(false);
      }
    }, [accessToken]);

  useFocusEffect(
    useCallback(() => {
      void loadDishes();
    }, [loadDishes])
  );

  const displayName =
    useMemo(() => {
      return (
        profile?.fullName?.trim() ||
        user?.email ||
        "Usuario"
      );
    }, [
      profile?.fullName,
      user?.email,
    ]);

  const displayEmail =
    useMemo(() => {
      return (
        profile?.email?.trim() ||
        user?.email ||
        ""
      );
    }, [
      profile?.email,
      user?.email,
    ]);

  const initial =
    useMemo(() => {
      const source =
        displayName ||
        displayEmail;

      return (
        source
          ?.trim()
          ?.charAt(0)
          ?.toUpperCase() ??
        "U"
      );
    }, [
      displayName,
      displayEmail,
    ]);

  const restaurantInitial =
    useMemo(() => {
      return (
        restaurantName
          .trim()
          .charAt(0)
          .toUpperCase() ||
        "R"
      );
    }, [restaurantName]);

  const visibleDishesCount =
    useMemo(() => {
      return dishes.filter(
        (dish) =>
          dish.isAvailable
      ).length;
    }, [dishes]);

  const handleSelectRestaurantImage =
    useCallback(async () => {
      if (!accessToken) {
        Alert.alert(
          "Sesión no disponible",
          "Vuelve a iniciar sesión."
        );
        return;
      }

      if (!profile?.restaurantId) {
        Alert.alert(
          "Restaurante no disponible",
          "No tienes un restaurante asignado."
        );
        return;
      }

      if (
        isUploadingRestaurantImage
      ) {
        return;
      }

      try {
        const permission =
          await ImagePicker
            .requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            "Permiso requerido",
            "Debes permitir el acceso a la galería para seleccionar una imagen."
          );
          return;
        }

        const result =
          await ImagePicker
            .launchImageLibraryAsync({
              mediaTypes: ["images"],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });

        if (
          result.canceled ||
          !result.assets?.length
        ) {
          return;
        }

        const asset =
          result.assets[0];

        const mimeType =
          asset.mimeType ??
          "image/jpeg";

        const fileName =
          createImageFileName(
            asset.fileName,
            mimeType
          );

        setIsUploadingRestaurantImage(
          true
        );

        const uploadedImageUrl =
          await uploadMyRestaurantImage(
            accessToken,
            {
              uri: asset.uri,
              name: fileName,
              type: mimeType,
            }
          );

        if (uploadedImageUrl) {
          setRestaurantImageUrl(
            addCacheVersion(
              uploadedImageUrl
            )
          );
        } else {
          const updatedRestaurant =
            await getRestaurantById(
              String(
                profile.restaurantId
              )
            );

          const updatedImageUrl =
            updatedRestaurant?.imageUrl ??
            null;

          if (updatedImageUrl) {
            setRestaurantImageUrl(
              addCacheVersion(
                updatedImageUrl
              )
            );
          } else {
            setRestaurantImageUrl(
              asset.uri
            );
          }
        }

        Alert.alert(
          "Correcto",
          "La imagen del restaurante fue actualizada."
        );
      } catch (error) {
        Alert.alert(
          "Error",
          getErrorMessage(
            error,
            "No se pudo actualizar la imagen del restaurante"
          )
        );
      } finally {
        setIsUploadingRestaurantImage(
          false
        );
      }
    }, [
      accessToken,
      isUploadingRestaurantImage,
      profile?.restaurantId,
    ]);

  const handleEditDish =
    useCallback(
      (dish: Dish) => {
        navigation.navigate(
          ROUTES.AddDish,
          {
            dish: {
              id: dish.id,
              name: dish.name,
              description:
                dish.description,
              price: dish.price,
            },
          }
        );
      },
      [navigation]
    );

  const handleRemoveDish =
    useCallback(
      async (
        dishId: string
      ) => {
        if (!accessToken) {
          Alert.alert(
            "Sesión no disponible",
            "Vuelve a iniciar sesión."
          );
          return;
        }

        if (removingDishId) {
          return;
        }

        try {
          setRemovingDishId(
            dishId
          );

          await deleteDish(
            accessToken,
            dishId
          );

          await loadDishes();
        } catch (error) {
          Alert.alert(
            "Error",
            getErrorMessage(
              error,
              "No se pudo eliminar el plato"
            )
          );
        } finally {
          setRemovingDishId(null);
        }
      },
      [
        accessToken,
        loadDishes,
        removingDishId,
      ]
    );

  const confirmRemoveDish =
    useCallback(
      (dish: Dish) => {
        Alert.alert(
          "Eliminar plato",
          `Se eliminará "${dish.name}". ¿Deseas continuar?`,
          [
            {
              text: "Volver",
              style: "cancel",
            },
            {
              text: "Eliminar",
              style: "destructive",
              onPress: () => {
                void handleRemoveDish(
                  dish.id
                );
              },
            },
          ]
        );
      },
      [handleRemoveDish]
    );

  const handleToggleHidden =
    useCallback(
      async (
        dish: Dish,
        nextHiddenValue: boolean
      ) => {
        if (!accessToken) {
          Alert.alert(
            "Sesión no disponible",
            "Vuelve a iniciar sesión."
          );
          return;
        }

        if (togglingDishId) {
          return;
        }

        const nextIsAvailable =
          !nextHiddenValue;

        const previousIsAvailable =
          dish.isAvailable;

        try {
          setTogglingDishId(
            dish.id
          );

          setDishes(
            (previous) =>
              previous.map(
                (item) =>
                  String(
                    item.id
                  ) ===
                  String(
                    dish.id
                  )
                    ? {
                        ...item,
                        isAvailable:
                          nextIsAvailable,
                      }
                    : item
              )
          );

          await updateDish(
            accessToken,
            dish.id,
            {
              is_available:
                nextIsAvailable,
            }
          );
        } catch (error) {
          setDishes(
            (previous) =>
              previous.map(
                (item) =>
                  String(
                    item.id
                  ) ===
                  String(
                    dish.id
                  )
                    ? {
                        ...item,
                        isAvailable:
                          previousIsAvailable,
                      }
                    : item
              )
          );

          Alert.alert(
            "Error",
            getErrorMessage(
              error,
              "No se pudo actualizar el plato"
            )
          );
        } finally {
          setTogglingDishId(null);
        }
      },
      [
        accessToken,
        togglingDishId,
      ]
    );

  const renderDish:
    ListRenderItem<Dish> =
    useCallback(
      ({ item }) => (
        <ManagerDishCard
          dish={item}
          isRemoving={
            removingDishId ===
            item.id
          }
          isRemovingDisabled={
            Boolean(
              removingDishId
            )
          }
          isInteractionDisabled={
            Boolean(
              togglingDishId
            ) ||
            Boolean(
              removingDishId
            )
          }
          onEdit={() =>
            handleEditDish(item)
          }
          onRemove={() =>
            confirmRemoveDish(item)
          }
          onToggleHidden={(
            value
          ) =>
            handleToggleHidden(
              item,
              value
            )
          }
        />
      ),
      [
        confirmRemoveDish,
        handleEditDish,
        handleToggleHidden,
        removingDishId,
        togglingDishId,
      ]
    );

  return (
    <Screen style={styles.container}>
      <View
        style={
          styles.backgroundDecor
        }
        pointerEvents="none"
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Svg
          width="100%"
          height={126}
          viewBox="0 0 360 126"
          preserveAspectRatio="none"
          style={
            styles.backgroundWave
          }
        >
          <Path
            d="M0 0 H360 V66 C292 94 224 40 148 64 C84 86 38 86 0 66 Z"
            fill={
              studentPalette.backgroundStrong
            }
          />
        </Svg>
      </View>

      <FlatList
        data={dishes}
        keyExtractor={(item) =>
          String(item.id)
        }
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
        initialNumToRender={12}
        windowSize={7}
        maxToRenderPerBatch={12}
        updateCellsBatchingPeriod={
          50
        }
        removeClippedSubviews
        ListHeaderComponent={
          <View>
            <ManagerProfileListHeader
              displayName={
                displayName
              }
              displayEmail={
                displayEmail
              }
              initial={initial}
              restaurantName={
                restaurantName
              }
              isLoadingDishes={
                isLoadingDishes
              }
              dishesCount={
                dishes.length
              }
              visibleDishesCount={
                visibleDishesCount
              }
            />

            <View
              style={
                styles.restaurantImageCard
              }
            >
              <Text
                style={
                  styles.restaurantImageTitle
                }
              >
                Imagen del restaurante
              </Text>

              <Text
                style={
                  styles.restaurantImageDescription
                }
              >
                Esta imagen será visible
                para los estudiantes.
              </Text>

              {restaurantImageUrl ? (
                <Image
                  source={{
                    uri:
                      restaurantImageUrl,
                  }}
                  style={
                    styles.restaurantImage
                  }
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={
                    styles.restaurantImagePlaceholder
                  }
                >
                  <Text
                    style={
                      styles.restaurantImageInitial
                    }
                  >
                    {restaurantInitial}
                  </Text>

                  <Text
                    style={
                      styles.restaurantImageEmptyText
                    }
                  >
                    Sin imagen
                  </Text>
                </View>
              )}

              <Pressable
                disabled={
                  isUploadingRestaurantImage ||
                  !profile?.restaurantId
                }
                style={[
                  styles.restaurantImageButton,
                  (
                    isUploadingRestaurantImage ||
                    !profile?.restaurantId
                  ) &&
                    styles.disabledButton,
                ]}
                onPress={() => {
                  void handleSelectRestaurantImage();
                }}
              >
                {isUploadingRestaurantImage ? (
                  <ActivityIndicator
                    color="#FFFFFF"
                  />
                ) : (
                  <Text
                    style={
                      styles.restaurantImageButtonText
                    }
                  >
                    {restaurantImageUrl
                      ? "Cambiar imagen"
                      : "Seleccionar imagen"}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        }
        renderItem={renderDish}
        ListEmptyComponent={
          <ManagerDishesFeedback
            isLoadingDishes={
              isLoadingDishes
            }
            dishesError={
              dishesError
            }
            onRetry={
              loadDishes
            }
            style={
              styles.feedbackState
            }
          />
        }
      />
    </Screen>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        studentPalette.background,
    },

    backgroundDecor: {
      ...StyleSheet.absoluteFillObject,
      overflow: "hidden",
    },

    backgroundWave: {
      position: "absolute",
      top: 0,
      right: 0,
      left: 0,
    },

    scrollContent: {
      paddingBottom: spacing.xxl,
    },

    feedbackState: {
      marginTop: spacing.sm,
      borderRadius: 22,
      borderColor:
        studentPalette.border,
      backgroundColor:
        studentPalette.card,
      shadowColor:
        studentPalette.shadow,
      shadowOpacity: 1,
      shadowRadius: 12,
      shadowOffset: {
        width: 0,
        height: 6,
      },
      elevation: 2,
    },

    restaurantImageCard: {
      marginHorizontal: spacing.md,
      marginTop: spacing.md,
      marginBottom: spacing.md,
      padding: spacing.md,
      borderRadius: 22,
      borderWidth: 1,
      borderColor:
        studentPalette.border,
      backgroundColor:
        studentPalette.card,
      gap: spacing.sm,
      shadowColor:
        studentPalette.shadow,
      shadowOpacity: 1,
      shadowRadius: 12,
      shadowOffset: {
        width: 0,
        height: 6,
      },
      elevation: 2,
    },

    restaurantImageTitle: {
      fontSize: 17,
      fontWeight: "800",
      color:
        studentPalette.textPrimary,
    },

    restaurantImageDescription: {
      color:
        studentPalette.textSecondary,
      fontSize: 13,
    },

    restaurantImage: {
      width: "100%",
      height: 210,
      borderRadius: 18,
      backgroundColor:
        studentPalette.backgroundStrong,
    },

    restaurantImagePlaceholder: {
      width: "100%",
      height: 210,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor:
        studentPalette.border,
      backgroundColor:
        studentPalette.backgroundStrong,
    },

    restaurantImageInitial: {
      fontSize: 52,
      fontWeight: "800",
      color:
        studentPalette.primary,
    },

    restaurantImageEmptyText: {
      marginTop: spacing.xs,
      color:
        studentPalette.textSecondary,
    },

    restaurantImageButton: {
      minHeight: 48,
      paddingHorizontal:
        spacing.md,
      paddingVertical:
        spacing.sm,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor:
        studentPalette.primary,
    },

    restaurantImageButtonText: {
      color: "#FFFFFF",
      fontWeight: "700",
    },

    disabledButton: {
      opacity: 0.5,
    },
  });
