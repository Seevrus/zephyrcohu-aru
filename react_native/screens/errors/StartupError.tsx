import { ScrollView, StyleSheet, View } from 'react-native';

import ErrorCard from '../../components/ErrorCard';
import Button from '../../components/ui/buttons/Button';
import colors from '../../constants/colors';
import { StartupErrorProps } from '../screen-types';

export default function Error({ route }: StartupErrorProps) {
  const { message } = route.params;

  const errorText = `${message} Amennyiben a probléma nem oldódik meg többszöri újraindítás után sem, kérem az alábbi gombra kattintva törölje az adatait, igényeljen új kódot az alkalmazás adminisztrátorától és az alkalmazás újraindítása után adja meg azt a megjelenő kezdőképernyőn.`;

  const appResetHandler = () => {};

  return (
    <ScrollView style={styles.container}>
      <View style={styles.error}>
        <ErrorCard>{errorText}</ErrorCard>
      </View>
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
    marginBottom: 60,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
