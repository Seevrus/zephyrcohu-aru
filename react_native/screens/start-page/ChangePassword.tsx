import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

import Loading from '../../components/Loading';
import ErrorCard from '../../components/info-cards/ErrorCard';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import colors from '../../constants/colors';

export default function ChangePassword() {
  const [password, setPassword] = useState<string>('');
  const [passwordRepeat, setPasswordRepeat] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const changePasswordHandler = (value: string) => {
    setErrorMessage('');
    setPassword(value);
  };

  const changePasswordRepeatHandler = (value: string) => {
    setErrorMessage('');
    setPasswordRepeat(value);
  };

  const changePasswordRequestHandler = () => {};

  const isChangePasswordButtonDisabled =
    password.length === 0 || passwordRepeat.length === 0 || !!errorMessage;

  if (isLoading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <View>
        <Text>Az új jelszóra vonatkozó szabályok:</Text>
        <Text>
          Megengedett karakterek: angol ábécé kis- és nagybetűi, arab számjegyek, valamit az alábbi
          speciális karakterek: . _ + # % @ -
        </Text>
        <Text>Legalább 10 karakter hosszúságú</Text>
        <Text>Nem egyezhet meg a korábbi 10 jelszóval</Text>
      </View>
      {!!errorMessage && (
        <View style={styles.error}>
          <ErrorCard>{errorMessage}</ErrorCard>
        </View>
      )}
      <View style={styles.form}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Input
            label="Jelszó"
            value={password}
            invalid={!!errorMessage}
            config={{
              secureTextEntry: true,
              autoCapitalize: 'none',
              autoComplete: 'off',
              autoCorrect: false,
              importantForAutofill: 'no',
              onChangeText: changePasswordHandler,
            }}
          />
          <Input
            label="Jelszó újra"
            value={passwordRepeat}
            invalid={!!errorMessage}
            config={{
              secureTextEntry: true,
              autoCapitalize: 'none',
              autoComplete: 'off',
              autoCorrect: false,
              importantForAutofill: 'no',
              onChangeText: changePasswordRepeatHandler,
            }}
          />
          <View style={styles.buttonContainer}>
            <Button
              variant={isChangePasswordButtonDisabled ? 'disabled' : 'ok'}
              onPress={changePasswordRequestHandler}
            >
              Jelszó megváltoztatása
            </Button>
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  error: {
    marginBottom: 30,
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
