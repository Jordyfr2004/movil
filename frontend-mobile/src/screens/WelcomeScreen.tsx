import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StatusBar, StyleSheet, useWindowDimensions, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  SCREEN_BACKGROUND,
  WelcomeBackground,
  WelcomeFooter,
  WelcomeHeader,
  WelcomeOptions,
  getWelcomeLayoutMetrics,
} from "../components/welcome";
import { ROUTES } from "../navigation/routes";
import { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, typeof ROUTES.Welcome>;

export function WelcomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const metrics = getWelcomeLayoutMetrics(width, height, insets.bottom);
  const isCompact = height < 760 || width < 360;

  const handleStudentPress = () => {
    navigation.navigate(ROUTES.StudentAccess);
  };

  const handleCommunityPress = () => {
    navigation.navigate(ROUTES.Login);
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={SCREEN_BACKGROUND} />

      <View style={styles.container}>
        <WelcomeBackground isCompact={isCompact} />

        <View style={styles.screenLayout}>
          <View
            style={[
              styles.mainSection,
              {
                paddingTop: metrics.contentTopPadding,
                paddingBottom: metrics.contentBottomPadding,
                paddingHorizontal: metrics.horizontalPadding,
              },
            ]}
          >
            <WelcomeHeader metrics={metrics} />
            <WelcomeOptions
              metrics={metrics}
              isCompact={isCompact}
              onStudentPress={handleStudentPress}
              onCommunityPress={handleCommunityPress}
            />
          </View>

          <WelcomeFooter metrics={metrics} screenWidth={width} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: SCREEN_BACKGROUND,
  },
  container: {
    flex: 1,
    backgroundColor: SCREEN_BACKGROUND,
    overflow: "hidden",
  },
  screenLayout: {
    flex: 1,
    justifyContent: "space-between",
  },
  mainSection: {
    flex: 1,
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    justifyContent: "center",
  },
});
