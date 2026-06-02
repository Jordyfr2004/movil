import React, { useLayoutEffect } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Alert,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  SCREEN_BACKGROUND,
  StudentAccessActions,
  StudentAccessBackground,
  StudentAccessFooter,
  StudentAccessHeader,
  getStudentAccessLayoutMetrics,
} from "../components/studentAccess";
import { ROUTES } from "../navigation/routes";
import { RootStackParamList } from "../navigation/types";
import { colors } from "../theme";

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.StudentAccess
>;

export function StudentAccessScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const metrics = getStudentAccessLayoutMetrics(width, height, insets.bottom);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Acceso estudiante",
      headerShadowVisible: false,
      headerTintColor: colors.textPrimary,
      headerStyle: {
        backgroundColor: SCREEN_BACKGROUND,
      },
    });
  }, [navigation]);

  const handleMicrosoftPress = () => {
    navigation.navigate(ROUTES.Login);
  };

  const handleGmailPress = () => {
    Alert.alert(
      "Próximamente",
      "El acceso con Gmail estará disponible pronto."
    );
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={SCREEN_BACKGROUND} />

      <View style={styles.container}>
        <StudentAccessBackground backgroundScale={metrics.backgroundScale} />

        <View
          style={[
            styles.layout,
            {
              paddingHorizontal: metrics.layoutHorizontalPadding,
            },
          ]}
        >
          <View
            style={[
              styles.centerContent,
              {
                paddingTop: metrics.centerContentTopPadding,
              },
            ]}
          >
            <StudentAccessHeader metrics={metrics} />
            <StudentAccessActions
              metrics={metrics}
              onMicrosoftPress={handleMicrosoftPress}
              onGmailPress={handleGmailPress}
            />
          </View>

          <StudentAccessFooter metrics={metrics} />
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
  layout: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
});
