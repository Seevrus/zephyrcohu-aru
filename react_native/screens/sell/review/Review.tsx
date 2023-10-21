import { add, dissoc, dissocPath, identity, prop, reduce } from 'ramda';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  ListRenderItem,
  ListRenderItemInfo,
  StyleSheet,
  View,
} from 'react-native';
import { formatCurrency } from 'react-native-format-currency';

import Loading from '../../../components/Loading';
import ErrorCard from '../../../components/info-cards/ErrorCard';
import Button from '../../../components/ui/Button';
import LabeledItem from '../../../components/ui/LabeledItem';
import colors from '../../../constants/colors';
import fontSizes from '../../../constants/fontSizes';
import { ReviewProps } from '../../../navigators/screen-types';
import { useSellFlowContext } from '../../../providers/SellFlowProvider';
import calculateAmounts from '../../../utils/calculateAmounts';
import Selection from './Selection';
import { ReviewRow } from './types';

const formatPrice = (amount: number) => formatCurrency({ amount, code: 'HUF' })[0];

export default function Review({ navigation }: ReviewProps) {
  const {
    isLoading: isContextLoading,
    items,
    selectedItems,
    setSelectedItems,
    resetSellFlowContext,
  } = useSellFlowContext();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<ReviewRow>(null);
  const [saveReceiptError, setSaveReceiptError] = useState<string>('');

  const receiptRows: ReviewRow[] = useMemo(
    () =>
      Object.entries(selectedItems)
        .flatMap(([itemId, expirations]) => {
          const item = items.find((i) => i.id === +itemId);

          if (!item) return undefined;

          return Object.entries(expirations)
            .map(([expirationId, quantity]) => {
              const expiration = item.expirations[expirationId];

              if (!expiration) return undefined;

              const { grossAmount } = calculateAmounts({
                netPrice: item.netPrice,
                quantity,
                vatRate: item.vatRate,
              });

              return {
                itemId: item.id,
                articleNumber: item.articleNumber,
                name: item.name,
                expirationId: expiration.id,
                expiresAt: expiration.expiresAt,
                quantity,
                unitName: item.unitName,
                netPrice: item.netPrice,
                grossAmount,
                availableDiscounts: item.availableDiscounts,
              };
            })
            .filter(identity);
        })
        .filter(identity),
    [items, selectedItems]
  );

  const grossAmount = reduce((acc, value) => add(prop('grossAmount', value), acc), 0, receiptRows);

  const removeItemHandler = useCallback(
    ({ itemId, expirationId }: { itemId: number; expirationId: number }) => {
      setSelectedItems((prevItems) => {
        if (Object.keys(prevItems[itemId]).length === 1) {
          return dissoc(itemId, prevItems);
        }

        return dissocPath([itemId, expirationId], prevItems);
      });
    },
    [setSelectedItems]
  );

  useEffect(() => {
    if (receiptRows?.length === 0) {
      setIsLoading(true);
      resetSellFlowContext().then(() => {
        setIsLoading(false);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Index' }],
        });
      });
    }
  }, [navigation, receiptRows?.length, resetSellFlowContext]);

  const removeReceiptHandler = useCallback(() => {
    Alert.alert(
      'Folyamat törlése',
      'Ez a lépés törli a jelenlegi árulevételi munkamenetet és visszairányít a kezdőoldalra. Biztosan folytatni szeretné?',
      [
        { text: 'Mégse' },
        {
          text: 'Biztosan ezt szeretném',
          onPress: async () => {
            setIsLoading(true);
            await resetSellFlowContext();
            setIsLoading(false);
            navigation.reset({
              index: 0,
              routes: [{ name: 'Index' }],
            });
          },
        },
      ]
    );
  }, [navigation, resetSellFlowContext]);

  /* const confirmReceiptHandler = async () => {
    Alert.alert(
      'Árulevétel véglegesítése',
      'Ez a lépés számlakészítéssel jár, ezután már nem lesz lehetőség semmilyen módosításra. Biztosan folytatni szeretné?',
      [
        { text: 'Mégse' },
        {
          text: 'Biztosan ezt szeretném',
          onPress: async () => {
            try {
              await dispatch(removeItemsFromStore());
              await dispatch(finalizeCurrentReceipt());
              navigation.reset({
                index: 1,
                routes: [{ name: 'Index' }, { name: 'Summary' }],
              });
            } catch (err) {
              setSaveReceiptError(err.message);
            }
          },
        },
      ]
    );
  }; */

  const renderReceiptRow: ListRenderItem<ReviewRow> = (info: ListRenderItemInfo<ReviewRow>) => (
    <Selection
      selected={
        `${info.item.itemId}-${info.item.expirationId}` ===
        `${selectedRow?.itemId}-${selectedRow?.expirationId}`
      }
      item={info.item}
      onSelect={(id: string) => {
        setSelectedRow(receiptRows.find((row) => `${row.itemId}-${row.expirationId}` === id));
      }}
      onDelete={removeItemHandler}
    />
  );

  if (isLoading || isContextLoading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      {!!saveReceiptError && (
        <View style={styles.error}>
          <ErrorCard>{saveReceiptError}</ErrorCard>
        </View>
      )}
      <View style={styles.headerContainer}>
        <View style={styles.headerButtonContainer}>
          <Button variant="ok" onPress={() => {}}>
            Extra tételek
          </Button>
        </View>
      </View>
      <View style={styles.receiptContainer}>
        <FlatList
          data={receiptRows}
          renderItem={renderReceiptRow}
          keyExtractor={(item) => `${item.itemId}-${item.expirationId}`}
        />
      </View>
      <View style={styles.footerContainer}>
        <View style={styles.grossAmountContainer}>
          <LabeledItem label="Mindösszesen" text={formatPrice(grossAmount)} />
        </View>
        <View style={styles.buttonsContainer}>
          <Button variant="warning" onPress={removeReceiptHandler}>
            Elvetés
          </Button>
          <Button variant="ok" onPress={() => {}}>
            Véglegesítés
          </Button>
        </View>
      </View>
    </View>
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
  headerContainer: {
    height: 70,
    marginHorizontal: '7%',
    marginTop: 10,
    alignItems: 'flex-end',
  },
  headerButtonContainer: {
    width: '40%',
  },
  receiptContainer: {
    flex: 1,
  },
  fieldContainer: {
    marginTop: 5,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sectionLabel: {
    fontWeight: '700',
    textDecorationLine: 'underline',
    textDecorationColor: 'white',
  },
  itemLabel: {
    fontWeight: '700',
    marginRight: 5,
  },
  receiptText: {
    color: 'white',
    fontSize: fontSizes.input,
  },
  sectionBorder: {
    borderColor: 'white',
    borderWidth: 1,
    marginVertical: 10,
  },
  footerContainer: {
    height: 110,
    marginTop: 5,
    backgroundColor: colors.neutral,
    borderTopColor: 'white',
    borderTopWidth: 2,
  },
  grossAmountContainer: {
    alignItems: 'flex-end',
    marginHorizontal: '7%',
    marginVertical: 10,
  },
  buttonsContainer: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: '7%',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});
