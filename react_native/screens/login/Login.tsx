import { useAtomValue } from 'jotai';
import { Suspense, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useLogin } from '../../api/mutations/useLogin';
import { useCheckToken } from '../../api/queries/useCheckToken';
import { userLoginIdentifierAtom } from '../../atoms/user';
import { Container } from '../../components/container/Container';
import { ErrorCard } from '../../components/info-cards/ErrorCard';
import { TextCard } from '../../components/info-cards/TextCard';
import { Loading } from '../../components/Loading';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { colors } from '../../constants/colors';
import { type LoginProps } from '../../navigators/screen-types';

function SuspendedLogin({ navigation }: LoginProps) {
  const { data: user, isFetching: isUserFetching } = useCheckToken();
  const { mutateAsync: login } = useLogin();

  const isRoundStarted = user?.state === 'R';

  const savedIdentifier = useAtomValue(userLoginIdentifierAtom);
  const [userLoginIdentifier, setUserLoginIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (savedIdentifier) {
      setUserLoginIdentifier(savedIdentifier);
    }
  }, [savedIdentifier]);

  const changeUserLoginIdentifierHandler = (value: string) => {
    setErrorMessage('');
    setUserLoginIdentifier(value);
  };

  const changePasswordHandler = (value: string) => {
    setErrorMessage('');
    setPassword(value);
  };

  const loginHandler = async () => {
    setErrorMessage('');

    try {
      setIsLoading(true);
      await login({
        userName: userLoginIdentifier.trim(),
        password: password.trim(),
      });

      navigation.reset({
        index: 0,
        routes: [{ name: 'Index' }],
      });
    } catch (error) {
      setIsLoading(false);
      setErrorMessage(error?.message);
      setPassword('');
    }
  };

  const isLoginButtonDisabled =
    userLoginIdentifier.length === 0 || password.length === 0 || !!errorMessage;

  if (isLoading || isUserFetching) {
    return <Loading />;
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.welcome}>
        {isRoundStarted ? (
          <TextCard>
            Számlabeküldéshez és a kör zárásához kérem adja meg újból a
            jelszavát.
          </TextCard>
        ) : (
          <TextCard>
            Üdvözöljük a{' '}
            <Text style={styles.cardEmphasized}>Zephyr Boreal</Text> áruforgalmi
            alkalmazás kezdőoldalán! Kérem jelentkezzen be.
          </TextCard>
        )}
      </View>
      {!!errorMessage && (
        <View style={styles.error}>
          <ErrorCard>{errorMessage}</ErrorCard>
        </View>
      )}
      <View style={styles.form}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Input
            label="Felhasználónév"
            value={userLoginIdentifier}
            invalid={!!errorMessage}
            config={{
              autoCapitalize: 'none',
              autoComplete: 'off',
              autoCorrect: false,
              editable: !isRoundStarted,
              importantForAutofill: 'no',
              onChangeText: changeUserLoginIdentifierHandler,
            }}
          />
          <Input
            label="Jelszó"
            value={password}
            invalid={!!errorMessage}
            config={{
              secureTextEntry: false,
              autoCapitalize: 'none',
              autoComplete: 'off',
              autoCorrect: false,
              importantForAutofill: 'no',
              onChangeText: changePasswordHandler,
            }}
          />
          <View style={styles.buttonContainer}>
            <Button
              variant={isLoginButtonDisabled ? 'disabled' : 'ok'}
              onPress={loginHandler}
            >
              Bejelentkezés
            </Button>
          </View>
        </KeyboardAvoidingView>
      </View>
    </ScrollView>
  );
}

export function Login(props: LoginProps) {
  return (
    <Suspense fallback={<Container />}>
      <SuspendedLogin {...props} />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  cardEmphasized: {
    fontWeight: 'bold',
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  error: {
    marginBottom: 30,
  },
  form: {
    backgroundColor: colors.neutral,
    borderRadius: 10,
    marginHorizontal: '5%',
    padding: 8,
  },
  welcome: {
    marginVertical: 30,
  },
});
