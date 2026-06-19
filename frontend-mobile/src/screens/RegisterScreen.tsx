import React, { useState, useLayoutEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { httpClient } from '../api/httpClient';
import { ROUTES } from '../navigation/routes';
import { SCREEN_BACKGROUND } from '../components/login';

type RegisterScreenProps = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.Register
>;

type UnknownRecord = Record<string, unknown>;

const STEPS = {
  FULL_NAME: 0,
  EMAIL: 1,
  PASSWORD: 2,
};

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function readRegisterErrorMessage(error: unknown) {
  if (!isRecord(error)) {
    return 'Algo salió mal';
  }

  const response = error.response;
  if (!isRecord(response)) {
    return 'Algo salió mal';
  }

  const data = response.data;
  if (!isRecord(data)) {
    return 'Algo salió mal';
  }

  return typeof data.message === 'string' && data.message.trim().length > 0
    ? data.message
    : 'Algo salió mal';
}

const RegisterScreen = ({ navigation }: RegisterScreenProps) => {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '',
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: SCREEN_BACKGROUND,
      },
    });
  }, [navigation]);

  const [step, setStep] = useState(STEPS.FULL_NAME);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (step === STEPS.FULL_NAME && fullName.trim() === '') {
      Alert.alert('Error', 'Por favor, introduce tu nombre completo.');
      return;
    }
    if (step === STEPS.EMAIL && email.trim() === '') {
      Alert.alert('Error', 'Por favor, introduce tu correo electrónico.');
      return;
    }
    if (step < STEPS.PASSWORD) {
      setStep(step + 1);
    } else {
      handleRegister();
    }
  };

  const handleBack = () => {
    if (step > STEPS.FULL_NAME) {
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleRegister = async () => {
    if (password.trim() === '') {
      Alert.alert('Error', 'Por favor, introduce tu contraseña.');
      return;
    }
    setLoading(true);
    try {
      await httpClient.post('/auth/register', {
        full_name: fullName,
        email,
        password,
      });
      Alert.alert('Éxito', 'Usuario registrado correctamente.');
      navigation.navigate(ROUTES.Login);
    } catch (error: unknown) {
      Alert.alert('Error', readRegisterErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = () => {
    switch (step) {
      case STEPS.FULL_NAME:
        return (
          <View style={styles.field}>
            <Text style={styles.inputLabel}>Nombre Completo</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              style={styles.input}
              placeholder="Nombre Completo"
              placeholderTextColor="#7A746F"
              autoCapitalize="words"
            />
          </View>
        );
      case STEPS.EMAIL:
        return (
          <View style={styles.field}>
            <Text style={styles.inputLabel}>Correo Electrónico</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              placeholder="Correo Electrónico"
              placeholderTextColor="#7A746F"
            />
          </View>
        );
      case STEPS.PASSWORD:
        return (
          <View style={styles.field}>
            <Text style={styles.inputLabel}>Contraseña</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="#7A746F"
            />
          </View>
        );
      default:
        return null;
    }
  };

  const buttonLabel = step === STEPS.PASSWORD ? 'Registrar' : 'Siguiente';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.stepText}>{`Paso ${step + 1} de 3`}</Text>
          {getStepContent()}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={buttonLabel}
            accessibilityState={{ busy: loading }}
            onPress={handleNext}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.buttonText}>{buttonLabel}</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SCREEN_BACKGROUND,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingTop: 40,
  },
  content: {
    padding: 16,
  },
  field: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 6,
    fontSize: 14,
    color: '#4B4744',
    fontWeight: '600',
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#D8D0C8',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    color: '#141312',
    fontSize: 16,
  },
  button: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    borderRadius: 14,
    backgroundColor: '#E56B4C',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  buttonPressed: {
    opacity: 0.92,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  stepText: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
    color: '#141312',
  },
});

export default RegisterScreen;
