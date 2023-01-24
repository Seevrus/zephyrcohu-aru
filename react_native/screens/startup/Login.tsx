import 'react-native-get-random-values';
import * as SecureStore from 'expo-secure-store';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

import { unwrapResult } from '@reduxjs/toolkit';
import { ErrorResponseT } from '../../store/base-types';
import { registerDevice } from '../../store/config-slice/config-slice';
import { useAppDispatch } from '../../store/hooks';

import ErrorCard from '../../components/ErrorCard';
import TextCard from '../../components/TextCard';
import Button from '../../components/ui/buttons/Button';
import Input from '../../components/ui/Input';
import colors from '../../constants/colors';

export default function Login({ navigation }) {
  const dispatch = useAppDispatch();

  const [tokenInput, setTokenInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const isTokenFormatValid = tokenInput.length !== 0;

  const inputChangedHandler = (value: string) => {
    setTokenInput(value);
  };

  const registerDeviceHandler = async () => {
    setErrorMessage('');

    try {
      const deviceId: string = uuidv4();
      const resultAction = await dispatch(registerDevice({ deviceId, token: tokenInput }));
      const result = unwrapResult(resultAction);
      console.log(result);
    } catch (rejectedValueOrSerializedError) {
      console.log(rejectedValueOrSerializedError);
    }

    // const deviceId: string = uuidv4();
    // dispatch(registerDevice({ deviceId, token: tokenInput }))
    //   .then(() => {})
    //   .catch((error: ErrorResponseT) => {
    //     if (error.status === 400) {
    //       setErrorMessage(
    //         'Ez a felhasználó egy másik eszközön már érvényesítette a hozzáférését. Amennyiben az alkalmazás újratelepítése vagy a készülék cseréje miatt újbóli bejelentkezésre van szükség, kérem igényeljen új kódot az alkalmazás adminisztrátorától.'
    //       );
    //     }
    //     if (error.status === 401) {
    //       setErrorMessage('A beírt token érvénytelen.');
    //     }
    //   });

    // SecureStore.setItemAsync('boreal-token', tokenInput)
    //   .then(() => {
    //     const deviceId: string = uuidv4();
    //     dispatch(registerDevice({ deviceId, token: tokenInput }))
    //       .then(() => {
    //         SecureStore.setItemAsync('boreal-device-id', deviceId)
    //           .then(() => {
    //             navigation.replace('StartupCheck');
    //           })
    //           .catch(() => {
    //             setErrorMessage('Váratlan hiba lépett fel az eszközazonosító tárolása során.');
    //             SecureStore.deleteItemAsync('boreal-token');
    //           });
    //       })
    //       .catch((error: ErrorResponseT) => {
    //         if (error.status === 401) {
    //           setErrorMessage(
    //             'Ez a felhasználó egy másik eszközön már érvényesítette a hozzáférését. Amennyiben az alkalmazás újratelepítése vagy a készülék cseréje miatt újbóli bejelentkezésre van szükség, kérem igényeljen új kódot az alkalmazás adminisztrátorától.'
    //           );
    //         }
    //         if (error.status === 401) {
    //           setErrorMessage('A beírt token érvénytelen.');
    //         }

    //         SecureStore.deleteItemAsync('boreal-token');
    //       });
    //   })
    //   .catch(() => {
    //     setErrorMessage('Váratlan hiba lépett fel a kód feldolgozása során.');
    //   });
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <TextCard>
        Üdvözöljük a <Text style={styles.cardEmphasized}>Zephyr Boreal</Text> áruforgalmi alkalmazás
        kezdőoldalán! A kezdéshez adja meg az adminisztrátorától kapott bejelentkezési kódot.
      </TextCard>
      {!!errorMessage && <ErrorCard>{errorMessage}</ErrorCard>}
      <View style={styles.form}>
        <View>
          <Input
            label="Kód"
            config={{
              autoCapitalize: 'none',
              autoComplete: 'off',
              autoCorrect: false,
              importantForAutofill: 'no',
              multiline: true,
              onChangeText: inputChangedHandler,
            }}
          />
          <View style={styles.buttonContainer}>
            <Button
              variant={isTokenFormatValid ? 'ok' : 'disabled'}
              onPress={registerDeviceHandler}
            >
              Alkalmazás regisztrációja
            </Button>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.purple500,
  },
  cardEmphasized: {
    fontWeight: 'bold',
  },
  form: {
    marginHorizontal: '5%',
    padding: 8,
    backgroundColor: colors.purple800,
    borderRadius: 10,
  },
  buttonContainer: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
