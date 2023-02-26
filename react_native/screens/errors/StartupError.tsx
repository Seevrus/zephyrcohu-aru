import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { useAppDispatch } from '../../store/hooks';
import { unregisterDevice } from '../../store/config-slice/config-api-actions';

import ErrorCard from '../../components/info-cards/ErrorCard';
import Button from '../../components/ui/Button';
import colors from '../../constants/colors';
import { StartupErrorProps } from '../screen-types';

export default function Error({ navigation, route }: StartupErrorProps) {
  const dispatch = useAppDispatch();
  const [additionalError, setAdditionalError] = useState<string>('');

  const { message } = route.params;

  const errorText = `${message} Amennyiben a probléma nem oldódik meg többszöri újraindítás után sem, kérem az alábbi gombra kattintva törölje az adatait, igényeljen új kódot az alkalmazás adminisztrátorától és az alkalmazás újraindítása után adja meg azt a megjelenő kezdőképernyőn.`;

  const tryAgainHandler = () => {
    navigation.replace('StartupCheck');
  };

  const appResetHandler = async () => {
    const onAlertConfirm = async () => {
      try {
        await dispatch(unregisterDevice());
        navigation.replace('StartupCheck');
      } catch (err) {
        setAdditionalError(err.message);
      }
    };

    Alert.alert('Megerősítés szükséges', 'Valóban törölni szeretné a regisztrációs adatait?', [
      { text: 'Mégsem' },
      { text: 'Igen', onPress: onAlertConfirm },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.error}>
        <ErrorCard>{errorText}</ErrorCard>
      </View>
      {additionalError && (
        <View style={styles.error}>
          <ErrorCard>{additionalError}</ErrorCard>
        </View>
      )}
      <View style={styles.buttonContainer}>
        <Button variant="neutral" onPress={tryAgainHandler}>
          Újrapróbálkozás
        </Button>
        <Button variant="error" onPress={appResetHandler}>
          Regisztrációs adatok törlése
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  error: {
    marginTop: 30,
  },
  buttonContainer: {
    marginTop: 30,
    height: 150,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
