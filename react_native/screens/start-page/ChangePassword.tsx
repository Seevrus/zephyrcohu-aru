import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import usePasswordChange from '../../api/mutations/usePasswordChange';
import Loading from '../../components/Loading';
import ErrorCard from '../../components/info-cards/ErrorCard';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import colors from '../../constants/colors';
import fontSizes from '../../constants/fontSizes';
import { ChangePasswordProps } from '../screen-types';

export default function ChangePassword({ navigation }: ChangePasswordProps) {
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
    } else if (!/^([a-zA-Z0-9._+#%@-]){10,}$/.test(password)) {
      setErrorMessage('A választott jelszó nem felel meg a szabályoknak.');
    } else {
      try {
        setIsLoading(true);
        await passwordChange.mutateAsync({ password });
        navigation.reset({
          index: 0,
          routes: [{ name: 'Index' }],
        });
      } catch (err) {
        setIsLoading(false);
        setErrorMessage(err.message);
        setPassword('');
        setPasswordRepeat('');
      }
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
          Megengedett karakterek: angol ábécé kis- és nagybetűi, arab számjegyek, valamit az alábbi
          speciális karakterek: . _ + # % @ -
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  passwordRules: {
    marginHorizontal: '5%',
    marginVertical: 10,
    padding: 8,
    backgroundColor: colors.neutral,
    borderRadius: 10,
  },
  passwordRuleCommon: {
    color: 'white',
    fontSize: fontSizes.body,
    marginVertical: 5,
  },
  passwordRuleHeader: {
    fontWeight: '700',
  },
  passwordRule: {
    marginLeft: 20,
  },
  error: {
    marginTop: 20,
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
