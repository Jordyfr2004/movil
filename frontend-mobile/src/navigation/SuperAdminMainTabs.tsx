import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { spacing } from "../constants/spacing";
import { useReduceMotion } from "../hooks/useReduceMotion";
import { useThemeColors } from "../hooks/useThemeColors";
import { SuperAdminRestaurantsScreen } from "../screens/SuperAdminRestaurantsScreen";
import { SuperAdminScreen } from "../screens/SuperAdminScreen";
import { SuperAdminUsersScreen } from "../screens/SuperAdminUsersScreen";
import { designSystem, typography } from "../theme";
import { ROUTES } from "./routes";
import { SuperAdminStackParamList } from "./types";

type Props = NativeStackScreenProps<
  SuperAdminStackParamList,
  typeof ROUTES.SuperAdminTabs
>;

type SuperAdminTabKey =
  | "home"
  | "users"
  | "restaurants";

type TabConfiguration = {
  key: SuperAdminTabKey;
  label: string;
  iconName: React.ComponentProps<
    typeof MaterialCommunityIcons
  >["name"];
  activeIconName: React.ComponentProps<
    typeof MaterialCommunityIcons
  >["name"];
};

const TAB_BAR_HEIGHT = 62;

const TABS: TabConfiguration[] = [
  {
    key: "home",
    label: "Inicio",
    iconName: "home-variant-outline",
    activeIconName: "home-variant",
  },
  {
    key: "users",
    label: "Usuarios",
    iconName: "account-group-outline",
    activeIconName: "account-group",
  },
  {
    key: "restaurants",
    label: "Restaurantes",
    iconName: "storefront-outline",
    activeIconName: "storefront",
  },
];

export function SuperAdminMainTabs({
  navigation,
}: Props) {
  const theme = useThemeColors();
  const insets = useSafeAreaInsets();

  const [
    activeTab,
    setActiveTab,
  ] = useState<SuperAdminTabKey>(
    "home"
  );

  const tabBottomPadding = Math.max(
    insets.bottom,
    spacing.xs
  );

  const bottomInset =
    TAB_BAR_HEIGHT +
    tabBottomPadding;

  const homeNavigation = useMemo(
    () => ({
      navigate: (
        routeName: string
      ) => {
        if (
          routeName ===
          ROUTES.SuperAdminUsers
        ) {
          setActiveTab("users");
          return;
        }

        if (
          routeName ===
          ROUTES.SuperAdminRestaurants
        ) {
          setActiveTab(
            "restaurants"
          );
          return;
        }

        navigation.navigate(
          routeName as never
        );
      },
    }),
    [navigation]
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            theme.background,
        },
      ]}
    >
      <SuperAdminTabScene
        activeTab={activeTab}
        bottomInset={bottomInset}
      >
        {activeTab === "home" ? (
          <SuperAdminScreen
            navigation={
              homeNavigation as never
            }
            route={
              {
                key: "super-admin-home",
                name:
                  ROUTES.SuperAdmin,
              } as never
            }
          />
        ) : null}

        {activeTab === "users" ? (
          <SuperAdminUsersScreen />
        ) : null}

        {activeTab ===
        "restaurants" ? (
          <SuperAdminRestaurantsScreen />
        ) : null}
      </SuperAdminTabScene>

      <View
        style={[
          styles.tabBar,
          {
            minHeight:
              TAB_BAR_HEIGHT +
              tabBottomPadding,

            paddingBottom:
              tabBottomPadding,

            backgroundColor:
              theme.surfaceElevated,

            borderColor:
              theme.border,
          },
        ]}
      >
        {TABS.map((tab) => (
          <SuperAdminTabButton
            key={tab.key}
            active={
              activeTab === tab.key
            }
            activeIconName={
              tab.activeIconName
            }
            iconName={
              tab.iconName
            }
            label={tab.label}
            onPress={() =>
              setActiveTab(tab.key)
            }
          />
        ))}
      </View>
    </View>
  );
}

function SuperAdminTabScene({
  activeTab,
  bottomInset,
  children,
}: {
  activeTab: SuperAdminTabKey;
  bottomInset: number;
  children: React.ReactNode;
}) {
  const reduceMotion =
    useReduceMotion();

  const opacity = useRef(
    new Animated.Value(1)
  ).current;

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(1);
      return;
    }

    opacity.setValue(0.85);

    Animated.timing(opacity, {
      toValue: 1,
      duration:
        designSystem.animation.fast,
      useNativeDriver: true,
    }).start();
  }, [
    activeTab,
    opacity,
    reduceMotion,
  ]);

  return (
    <Animated.View
      style={[
        styles.scene,
        {
          opacity,
          paddingBottom:
            bottomInset,
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

function SuperAdminTabButton({
  active,
  activeIconName,
  iconName,
  label,
  onPress,
}: {
  active: boolean;
  activeIconName: React.ComponentProps<
    typeof MaterialCommunityIcons
  >["name"];
  iconName: React.ComponentProps<
    typeof MaterialCommunityIcons
  >["name"];
  label: string;
  onPress: () => void;
}) {
  const theme = useThemeColors();

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{
        selected: active,
      }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tabButton,
        pressed &&
          styles.tabButtonPressed,
      ]}
    >
      <View
        style={[
          styles.tabIconContainer,

          active && {
            backgroundColor:
              theme.primaryFaint,

            borderColor:
              theme.primarySoft,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={
            active
              ? activeIconName
              : iconName
          }
          size={23}
          color={
            active
              ? theme.primary
              : theme.textMuted
          }
        />
      </View>

      <Text
        style={[
          styles.tabLabel,
          {
            color: active
              ? theme.primary
              : theme.textMuted,
          },
          active &&
            styles.tabLabelActive,
        ]}
      >
        {label}
      </Text>

      {active ? (
        <View
          style={[
            styles.activeIndicator,
            {
              backgroundColor:
                theme.primary,
            },
          ]}
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scene: {
    flex: 1,
  },

  tabBar: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
    flexDirection: "row",
    alignItems: "flex-start",
    borderTopWidth: 1,
    ...designSystem.shadows.medium,
  },

  tabButton: {
    position: "relative",
    flex: 1,
    minHeight: TAB_BAR_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingTop: spacing.xs,
  },

  tabButtonPressed: {
    opacity: 0.76,
  },

  tabIconContainer: {
    width: 38,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius:
      designSystem.radii.pill,
    borderWidth: 1,
    borderColor: "transparent",
  },

  tabLabel: {
    fontSize:
      typography.sizes.xs,
    lineHeight:
      typography.lineHeights.xs,
    fontWeight:
      typography.weights.semiBold,
  },

  tabLabelActive: {
    fontWeight:
      typography.weights.bold,
  },

  activeIndicator: {
    position: "absolute",
    bottom: 0,
    width: 34,
    height: 3,
    borderRadius:
      designSystem.radii.pill,
  },
});