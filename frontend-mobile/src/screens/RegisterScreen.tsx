import React, { useState, useLayoutEffect } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button, TextInput, Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { httpClient } from '../api/httpClient';
import { ROUTES } from '../navigation/routes';
import { SCREEN_BACKGROUND } from '../components/login';

type RegisterScreenProps = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.Register
>;

const STEPS = {
  FULL_NAME: 0,
  EMAIL: 1,
  PASSWORD: 2,
};

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
    } catch (error: any) {
      console.error(JSON.stringify(error.response, null, 2));
      Alert.alert('Error', error.response?.data?.message || 'Algo salió mal');
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = () => {
    switch (step) {
      case STEPS.FULL_NAME:
        return (
          <TextInput
            label="Nombre Completo"
            value={fullName}
            onChangeText={setFullName}
            mode="outlined"
            style={styles.input}
          />
        );
      case STEPS.EMAIL:
        return (
          <TextInput
            label="Correo Electrónico"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            mode="outlined"
            style={styles.input}
          />
        );
      case STEPS.PASSWORD:
        return (
          <TextInput
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            mode="outlined"
            style={styles.input}
          />
        );
      default:
        return null;
    }
  };

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
          <Button
            mode="contained"
            onPress={handleNext}
            loading={loading}
            style={styles.button}
          >
            {step === STEPS.PASSWORD ? 'Registrar' : 'Siguiente'}
          </Button>
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
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
  stepText: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
});

export default RegisterScreen;
