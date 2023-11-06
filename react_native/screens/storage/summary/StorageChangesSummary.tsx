import { useNetInfo } from '@react-native-community/netinfo';
import { Suspense } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Loading } from '../../../components/Loading';
import { Container } from '../../../components/container/Container';
import { Button } from '../../../components/ui/Button';
import { colors } from '../../../constants/colors';
import { fontSizes } from '../../../constants/fontSizes';
import { type StorageChangesSummaryProps } from '../../../navigators/screen-types';
import { useStorageChangesSummaryData } from './useStorageChangesSummaryData';

function SuspendedStorageChangesSummary({
  navigation,
}: StorageChangesSummaryProps) {
  const { isInternetReachable } = useNetInfo();

  const { isLoading, isPrintEnabled, printButtonHandler, returnButtonHandler } =
    useStorageChangesSummaryData(navigation);

  const printButtonVariant = isPrintEnabled ? 'ok' : 'disabled';
  const returnButtonVariant =
    isInternetReachable === true ? 'warning' : 'disabled';

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Container style={styles.container}>
      <Text style={styles.header}>Rakodás mentése sikeres!</Text>
      <Text style={styles.text}>
        Az alábbi gombra kattintva jegyzék nyomtatható a rakodás adatairól.
      </Text>
      <View style={styles.buttonContainer}>
        <Button variant={printButtonVariant} onPress={printButtonHandler}>
          Rakjegyzék nyomtatása
        </Button>
      </View>

      <Text style={styles.text}>
        Az alábbi gombra kattintva befejeződik a rakodási folyamat. A
        későbbiekben nyomtatásra már nem lesz lehetőség!
      </Text>
      <View style={styles.buttonContainer}>
        <Button variant={returnButtonVariant} onPress={returnButtonHandler}>
          Visszatérés a kezdőképernyőre
        </Button>
      </View>
    </Container>
  );
}

export function StorageChangesSummary(props: StorageChangesSummaryProps) {
  return (
    <Suspense fallback={<Container />}>
      <SuspendedStorageChangesSummary {...props} />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
    marginTop: 20,
  },
  container: {
    paddingHorizontal: '7%',
    paddingTop: 20,
  },
  header: {
    alignSelf: 'center',
    color: colors.white,
    fontFamily: 'Muli',
    fontSize: fontSizes.subtitle,
    marginBottom: 20,
  },
  text: {
    color: colors.white,
    fontFamily: 'Muli',
    fontSize: fontSizes.body,
  },
});
