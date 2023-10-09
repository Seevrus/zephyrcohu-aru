import * as Print from 'expo-print';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import useDeselectStore from '../../../api/mutations/useDeselectStore';
import useCheckToken from '../../../api/queries/useCheckToken';
import Button from '../../../components/ui/Button';
import colors from '../../../constants/colors';
import fontSizes from '../../../constants/fontSizes';
import { useStorageFlowContext } from '../../../providers/StorageFlowProvider';
import { useStorageContext } from '../../../providers/StorageProvider';
import { StorageChangesSummaryProps } from '../../../navigators/screen-types';
import createPrint from './createPrint';

export default function StorageChangesSummary({ navigation }: StorageChangesSummaryProps) {
  const { data: user } = useCheckToken();
  const { mutateAsync: deselectStore } = useDeselectStore();
  const { originalStorage, clearStorageFromContext } = useStorageContext();
  const { items, resetStorageFlowContext } = useStorageFlowContext();

  const receiptItems = useMemo(
    () => (items ?? []).filter((item) => !!item.originalQuantity || !!item.currentQuantity),
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
        Az alábbi gombra kattintva befejeződik a rakodási folyamat. A későbbiekben nyomtatásra már
        nem lesz lehetőség!
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
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: '7%',
    paddingTop: 20,
  },
  textCardContainer: {
    marginBottom: 30,
  },
  header: {
    marginBottom: 20,
    alignSelf: 'center',
    color: 'white',
    fontFamily: 'Muli',
    fontSize: fontSizes.subtitle,
  },
  text: {
    color: 'white',
    fontFamily: 'Muli',
    fontSize: fontSizes.body,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 40,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
