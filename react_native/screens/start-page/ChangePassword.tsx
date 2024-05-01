import { useState } from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { usePasswordChange } from '../../api/mutations/usePasswordChange';
import { ErrorCard } from '../../components/info-cards/ErrorCard';
import { SuccessCard } from '../../components/info-cards/SuccessCard';
import { Loading } from '../../components/Loading';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { colors } from '../../constants/colors';
import { fontSizes } from '../../constants/fontSizes';

export function ChangePassword() {
  const passwordChange = usePasswordChange();

  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const changePasswordHandler = (value: string) => {
    setErrorMessage('');
    setSuccessMessage('');
    setPassword(value);
  };

  const changePasswordRequestHandler = async () => {
    if (/^([\dA-Za-z]){10}$/.test(password)) {
      try {
        setIsLoading(true);
        await passwordChange.mutateAsync({ password });
        setIsLoading(false);
        setSuccessMessage('Jelszó megváltoztatása sikeres.');
      } catch (error) {
        setIsLoading(false);
        setErrorMessage(error.message);
        setPassword('');
      }
    } else {
      setErrorMessage('A választott jelszó nem felel meg a szabályoknak.');
    }
  };

  const isChangePasswordButtonDisabled =
    password.length === 0 || !!errorMessage;

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
          Megengedett karakterek: angol ábécé kis- és nagybetűi és arab
          számjegyek
        </Text>
        <Text style={[styles.passwordRuleCommon, styles.passwordRule]}>
          Pontosan 10 karakter hosszúságú
        </Text>
        <Text style={[styles.passwordRuleCommon, styles.passwordRule]}>
          Nem egyezhet meg a korábbi 10 jelszóval
        </Text>
      </View>
      {!!errorMessage && (
        <View style={styles.card}>
          <ErrorCard>{errorMessage}</ErrorCard>
        </View>
      )}
      {!!successMessage && (
        <View style={styles.card}>
          <SuccessCard>{successMessage}</SuccessCard>
        </View>
      )}
      <KeyboardAvoidingView behavior="height" style={styles.form}>
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
            variant={isChangePasswordButtonDisabled ? 'disabled' : 'ok'}
            onPress={changePasswordRequestHandler}
          >
            Jelszó megváltoztatása
          </Button>
        </View>
      </KeyboardAvoidingView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  card: {
    marginBottom: 30,
    marginTop: 20,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
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
