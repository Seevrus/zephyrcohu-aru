import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import useLogin from '../../api/mutations/useLogin';
import ErrorCard from '../../components/info-cards/ErrorCard';
import TextCard from '../../components/info-cards/TextCard';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import colors from '../../constants/colors';
import { LoginProps } from '../screen-types';
import Loading from '../../components/Loading';

export default function Login({ navigation }: LoginProps) {
  const login = useLogin();

  const [userName, setUserName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const changeUserNameHandler = (value: string) => {
    setErrorMessage('');
    setUserName(value);
  };

  const changePasswordHandler = (value: string) => {
    setErrorMessage('');
    setPassword(value);
  };

  const loginHandler = async () => {
    setErrorMessage('');

    try {
      setIsLoading(true);
      await login.mutateAsync({ userName, password });
      navigation.reset({
        index: 0,
        routes: [{ name: 'Index' }],
      });
    } catch (err) {
      setIsLoading(false);
      setErrorMessage(err.message);
      setPassword('');
    }
  };

  const isLoginButtonDisabled = userName.length === 0 || password.length === 0 || !!errorMessage;

  if (isLoading) {
    return <Loading />;
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.welcome}>
        <TextCard>
          Üdvözöljük a <Text style={styles.cardEmphasized}>Zephyr Boreal</Text> áruforgalmi
          alkalmazás kezdőoldalán! Kérem jelentkezzen be.
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
            label="Felhasználónév"
            value={userName}
            invalid={!!errorMessage}
            config={{
              autoCapitalize: 'none',
              autoComplete: 'off',
              autoCorrect: false,
              importantForAutofill: 'no',
              onChangeText: changeUserNameHandler,
            }}
          />
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
          <View style={styles.buttonContainer}>
            <Button variant={isLoginButtonDisabled ? 'disabled' : 'ok'} onPress={loginHandler}>
              Bejelentkezés
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
