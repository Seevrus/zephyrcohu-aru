import * as Print from 'expo-print';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useDeselectStore } from '../../../api/mutations/useDeselectStore';
import { useCheckToken } from '../../../api/queries/useCheckToken';
import { Loading } from '../../../components/Loading';
import { Button } from '../../../components/ui/Button';
import { colors } from '../../../constants/colors';
import { fontSizes } from '../../../constants/fontSizes';
import { type StorageChangesSummaryProps } from '../../../navigators/screen-types';
import { useStorageFlowContext } from '../../../providers/StorageFlowProvider';
import { useStorageContext } from '../../../providers/StorageProvider';
import { createPrint } from './createPrint';

export function StorageChangesSummary({
  navigation,
}: StorageChangesSummaryProps) {
  const { data: user, isPending: isUserPending } = useCheckToken();
  const { mutateAsync: deselectStore } = useDeselectStore();
  const {
    isPending: isStorageContextPending,
    originalStorage,
    clearStorageFromContext,
  } = useStorageContext();
  const {
    isPending: isStorageFlowContextPending,
    items,
    resetStorageFlowContext,
  } = useStorageFlowContext();

  const receiptItems = useMemo(
    () =>
      (items ?? []).filter(
        (item) => !!item.originalQuantity || !!item.currentQuantity
      ),
    [items]
  );

  const printButtonHandler = async () => {
    await Print.printAsync({
      html: createPrint({ receiptItems, storeDetails: originalStorage, user }),
    });
  };

  const returnButtonHandler = async () => {
    await deselectStore();
    clearStorageFromContext();
    resetStorageFlowContext();
    navigation.replace('Index');
  };

  const isPrintEnabled = !!user && !!originalStorage && !!items;
  const printButtonVariant = isPrintEnabled ? 'ok' : 'disabled';

  if (isUserPending || isStorageContextPending || isStorageFlowContextPending) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
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
        <Button variant="warning" onPress={returnButtonHandler}>
          Visszatérés a kezdőképernyőre
        </Button>
      </View>
    </View>
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
    backgroundColor: colors.background,
    flex: 1,
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
