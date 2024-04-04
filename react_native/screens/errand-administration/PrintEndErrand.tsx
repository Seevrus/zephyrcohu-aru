import { Suspense } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Alert } from '../../components/alert/Alert';
import { Container } from '../../components/container/Container';
import { Loading } from '../../components/Loading';
import { Button } from '../../components/ui/Button';
import { colors } from '../../constants/colors';
import { fontSizes } from '../../constants/fontSizes';
import { type PrintEndErrandProps } from '../../navigators/screen-types';
import { usePrintEndErrandData } from './usePrintEndErrandData';

function SuspendedPrintEndErrand({ navigation }: PrintEndErrandProps) {
  const {
    isLoading,
    isPrintEnabled,
    isPrinted,
    exitConfimationHandler,
    printButtonHandler,
    alert,
  } = usePrintEndErrandData(navigation);

  const printButtonVariant = isPrintEnabled ? 'ok' : 'disabled';
  const returnButtonVariant = isPrinted ? 'ok' : 'disabled';

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Container style={styles.container}>
      <Text style={styles.header}>Kör mentése sikeres!</Text>
      <Text style={styles.text}>
        Az alábbi gombra kattintva összegzés nyomtatható a kör során készült
        számlák adatairól.
      </Text>
      <View style={styles.buttonContainer}>
        <Button variant={printButtonVariant} onPress={printButtonHandler}>
          Számlajegyzék nyomtatása
        </Button>
      </View>

      <Text style={styles.text}>
        Az alábbi gombra kattintva befejeződik a körzárás. A későbbiekben
        nyomtatásra már nem lesz lehetőség!
      </Text>
      <View style={styles.buttonContainer}>
        <Button variant={returnButtonVariant} onPress={exitConfimationHandler}>
          Visszatérés a kezdőképernyőre
        </Button>
      </View>
      <Alert
        visible={alert.isAlertVisible}
        title={alert.alertTitle}
        message={alert.alertMessage}
        buttons={{
          cancel: {
            text: 'Mégsem',
            variant: 'neutral',
            onPress: alert.resetAlertHandler,
          },
          confirm: alert.alertConfirmButton,
        }}
        onBackdropPress={alert.resetAlertHandler}
      />
    </Container>
  );
}

export function PrintEndErrand(props: PrintEndErrandProps) {
  return (
    <Suspense>
      <SuspendedPrintEndErrand {...props} />
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
    fontFamily: 'Nunito-Sans',
    fontSize: fontSizes.subtitle,
    marginBottom: 20,
  },
  text: {
    color: colors.white,
    fontFamily: 'Nunito-Sans',
    fontSize: fontSizes.body,
  },
});
