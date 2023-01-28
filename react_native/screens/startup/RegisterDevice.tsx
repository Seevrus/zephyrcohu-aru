import 'react-native-get-random-values';

import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

import { registerDevice } from '../../store/config-slice/config-api-actions';
import { useAppDispatch } from '../../store/hooks';

import ErrorCard from '../../components/info-cards/ErrorCard';
import TextCard from '../../components/info-cards/TextCard';
import Button from '../../components/ui/buttons/Button';
import Input from '../../components/ui/Input';
import colors from '../../constants/colors';
import { RegisterDeviceProps } from '../screen-types';

export default function RegisterDevice({ navigation }: RegisterDeviceProps) {
  const dispatch = useAppDispatch();

  const [tokenInput, setTokenInput] = useState<string>(
    '2|P72s8RYNuiSQzC8EmEVAp6WJCACiNPr3TqfE4AYl'
  );
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!tokenInput.length) {
      setErrorMessage('');
    }
  }, [tokenInput.length]);

  const inputChangedHandler = (value: string) => {
    setTokenInput(value);
  };

  const registerDeviceHandler = async () => {
    setErrorMessage('');
    const deviceId: string = uuidv4();

    try {
      await dispatch(registerDevice({ deviceId, token: tokenInput }));
    } catch (err) {
      setErrorMessage(err.message);
      return;
    }

    try {
      await SecureStore.setItemAsync('boreal-token', tokenInput);
      await SecureStore.setItemAsync('boreal-device-id', deviceId);
    } catch (_) {
      setErrorMessage('Váratlan hiba lépett fel az eszközazonosító tárolása során.');
      return;
    }

    navigation.replace('StartupCheck');
  };

  const isRegisterButtonDisabled = tokenInput.length === 0 || !!errorMessage;

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.welcome}>
        <TextCard>
          Üdvözöljük a <Text style={styles.cardEmphasized}>Zephyr Boreal</Text> áruforgalmi
          alkalmazás kezdőoldalán! A kezdéshez adja meg az adminisztrátorától kapott bejelentkezési
          kódot.
        </TextCard>
      </View>
      {!!errorMessage && (
        <View style={styles.error}>
          <ErrorCard>{errorMessage}</ErrorCard>
        </View>
      )}
      <View style={styles.form}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Input
            label="Kód"
            config={{
              autoCapitalize: 'none',
              autoComplete: 'off',
              autoCorrect: false,
              importantForAutofill: 'no',
              multiline: true,
              onChangeText: inputChangedHandler,
              value: '2|P72s8RYNuiSQzC8EmEVAp6WJCACiNPr3TqfE4AYl',
            }}
          />
          <View style={styles.buttonContainer}>
            <Button
              variant={isRegisterButtonDisabled ? 'disabled' : 'ok'}
              onPress={registerDeviceHandler}
            >
              Alkalmazás regisztrációja
            </Button>
          </View>
        </KeyboardAvoidingView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  welcome: {
    marginVertical: 30,
  },
  error: {
    marginBottom: 30,
  },
  cardEmphasized: {
    fontWeight: 'bold',
  },
  form: {
    marginHorizontal: '5%',
    padding: 8,
    backgroundColor: colors.neutral,
    borderRadius: 10,
  },
  buttonContainer: {
    marginTop: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
