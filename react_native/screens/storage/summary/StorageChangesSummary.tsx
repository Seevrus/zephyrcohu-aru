import { useNetInfo } from '@react-native-community/netinfo';
import * as Print from 'expo-print';
import { Suspense, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAtom, useAtomValue } from 'jotai';
import { useDeselectStore } from '../../../api/mutations/useDeselectStore';
import { checkTokenAtom } from '../../../api/queries/checkTokenAtom';
import {
  primaryStoreAtom,
  selectedStoreAtom,
  selectedStoreInitialStateAtom,
} from '../../../atoms/storage';
import {
  isStorageSavedToApiAtom,
  storageListItemsAtom,
} from '../../../atoms/storageFlow';
import { Loading } from '../../../components/Loading';
import { Button } from '../../../components/ui/Button';
import { colors } from '../../../constants/colors';
import { fontSizes } from '../../../constants/fontSizes';
import { type StorageChangesSummaryProps } from '../../../navigators/screen-types';
import { createPrint } from './createPrint';

function SuspendedStorageChangesSummary({
  navigation,
}: StorageChangesSummaryProps) {
  const { isInternetReachable } = useNetInfo();

  const { data: user, isPending: isUserPending } = useAtomValue(checkTokenAtom);
  const { mutateAsync: deselectStore } = useDeselectStore();

  const [, setPrimaryStore] = useAtom(primaryStoreAtom);
  const [selectedStoreInitialState, setSelectedStoreInitialState] = useAtom(
    selectedStoreInitialStateAtom
  );
  const [, setSelectedStore] = useAtom(selectedStoreAtom);

  const [, setIsStorageSavedToApi] = useAtom(isStorageSavedToApiAtom);
  const [storageListItems, setStorageListItems] = useAtom(storageListItemsAtom);

  const receiptItems = useMemo(
    () =>
      (storageListItems ?? []).filter(
        (item) => !!item.originalQuantity || !!item.currentQuantity
      ),
    [storageListItems]
  );

  const printButtonHandler = async () => {
    await Print.printAsync({
      html: createPrint({
        receiptItems,
        storeDetails: selectedStoreInitialState,
        user,
      }),
    });
  };

  const returnButtonHandler = async () => {
    await deselectStore();

    setPrimaryStore(null);
    setSelectedStoreInitialState(null);
    setSelectedStore(null);

    setIsStorageSavedToApi(false);
    setStorageListItems(undefined);

    navigation.reset({
      index: 0,
      routes: [{ name: 'Index' }],
    });
  };

  const isPrintEnabled = !!user && !!selectedStoreInitialState;
  const printButtonVariant = isPrintEnabled ? 'ok' : 'disabled';
  const returnButtonVariant =
    isInternetReachable === true ? 'warning' : 'disabled';

  if (isUserPending) {
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
        <Button variant={returnButtonVariant} onPress={returnButtonHandler}>
          Visszatérés a kezdőképernyőre
        </Button>
      </View>
    </View>
  );
}

export function StorageChangesSummary(props: StorageChangesSummaryProps) {
  return (
    <Suspense>
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
