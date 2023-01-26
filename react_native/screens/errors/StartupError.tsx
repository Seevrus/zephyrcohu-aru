import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useAppDispatch } from '../../store/hooks';
import { unregisterDevice } from '../../store/config-slice/config-api-actions';

import ErrorCard from '../../components/ErrorCard';
import Button from '../../components/ui/buttons/Button';
import colors from '../../constants/colors';
import { StartupErrorProps } from '../screen-types';

export default function Error({ navigation, route }: StartupErrorProps) {
  const dispatch = useAppDispatch();
  const [additionalError, setAdditionalError] = useState<string>('');

  const { message } = route.params;

  const errorText = `${message} Amennyiben a probléma nem oldódik meg többszöri újraindítás után sem, kérem az alábbi gombra kattintva törölje az adatait, igényeljen új kódot az alkalmazás adminisztrátorától és az alkalmazás újraindítása után adja meg azt a megjelenő kezdőképernyőn.`;

  const appResetHandler = async () => {
    try {
      await dispatch(unregisterDevice());
      navigation.replace('StartupCheck');
    } catch (err) {
      setAdditionalError(err.message);
    }
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
    backgroundColor: colors.purple500,
  },
  error: {
    marginTop: 30,
  },
  buttonContainer: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
