import React, { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { spacing } from "../constants/spacing";
import { designSystem, typography } from "../theme";
import { AppButton } from "./AppButton";

type Props = {
  children: ReactNode;
};

type State = {
  error: Error | null;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    if (__DEV__) {
      console.log("[error-boundary]", {
        message: error.message,
      });
    }
  }

  private reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Algo salió mal</Text>
        <Text style={styles.message}>
          No pudimos mostrar esta pantalla. Puedes intentarlo otra vez o volver
          al inicio.
        </Text>
        {__DEV__ ? (
          <Text style={styles.debug} numberOfLines={4}>
            {this.state.error.message}
          </Text>
        ) : null}
        <View style={styles.actions}>
          <AppButton label="Reintentar" onPress={this.reset} />
          <AppButton
            label="Volver al inicio"
            onPress={this.reset}
            variant="secondary"
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: designSystem.colors.background,
  },
  title: {
    color: designSystem.colors.textPrimary,
    fontSize: typography.roles.screenTitle.fontSize,
    lineHeight: typography.roles.screenTitle.lineHeight,
    fontWeight: typography.roles.screenTitle.fontWeight,
    textAlign: "center",
  },
  message: {
    marginTop: spacing.sm,
    color: designSystem.colors.textSecondary,
    fontSize: typography.roles.body.fontSize,
    lineHeight: typography.roles.body.lineHeight,
    textAlign: "center",
  },
  debug: {
    marginTop: spacing.md,
    color: designSystem.colors.danger,
    fontSize: typography.roles.caption.fontSize,
    textAlign: "center",
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
});
