import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { usePasswordChange } from '../../api/mutations/usePasswordChange';
import { ErrorCard } from '../../components/info-cards/ErrorCard';
import { Loading } from '../../components/Loading';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { colors } from '../../constants/colors';
import { fontSizes } from '../../constants/fontSizes';
import { type ChangePasswordProps } from '../../navigators/screen-types';

export function ChangePassword({ navigation }: ChangePasswordProps) {
  const passwordChange = usePasswordChange();

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

  const changePasswordRequestHandler = async () => {
    if (password !== passwordRepeat) {
      setErrorMessage('A beírt jelszavak nem egyeznek meg egymással.');
    } else if (/^([\w#%+.@-]){10,}$/.test(password)) {
      try {
        setIsLoading(true);
        await passwordChange.mutateAsync({ password });
        navigation.reset({
          index: 0,
          routes: [{ name: 'Index' }],
        });
      } catch (error) {
        setIsLoading(false);
        setErrorMessage(error.message);
        setPassword('');
        setPasswordRepeat('');
      }
    } else {
      setErrorMessage('A választott jelszó nem felel meg a szabályoknak.');
    }
  };

  const isChangePasswordButtonDisabled =
    password.length === 0 || passwordRepeat.length === 0 || !!errorMessage;

  if (isLoading) {
    return <Loading />;
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.passwordRules}>
        <Text style={[styles.passwordRuleCommon, styles.passwordRuleHeader]}>
          Az új jelszóra vonatkozó szabályok:
        </Text>
        <Text style={[styles.passwordRuleCommon, styles.passwordRule]}>
          Megengedett karakterek: angol ábécé kis- és nagybetűi, arab
          számjegyek, valamit az alábbi speciális karakterek: . _ + # % @ -
        </Text>
        <Text style={[styles.passwordRuleCommon, styles.passwordRule]}>
          Legalább 10 karakter hosszúságú
        </Text>
        <Text style={[styles.passwordRuleCommon, styles.passwordRule]}>
          Nem egyezhet meg a korábbi 10 jelszóval
        </Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  error: {
    marginBottom: 30,
    marginTop: 20,
  },
  form: {
    backgroundColor: colors.neutral,
    borderRadius: 10,
    marginHorizontal: '5%',
    padding: 8,
  },
  passwordRule: {
    marginLeft: 20,
  },
  passwordRuleCommon: {
    color: colors.white,
    fontSize: fontSizes.body,
    marginVertical: 5,
  },
  passwordRuleHeader: {
    fontWeight: '700',
  },
  passwordRules: {
    backgroundColor: colors.neutral,
    borderRadius: 10,
    marginHorizontal: '5%',
    marginVertical: 10,
    padding: 8,
  },
});
