import {
  add,
  ascend,
  defaultTo,
  flatten,
  keys,
  map,
  pathOr,
  pipe,
  prop,
  reduce,
  sortWith,
  __,
} from 'ramda';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  ListRenderItem,
  ListRenderItemInfo,
  StyleSheet,
  View,
} from 'react-native';
import { formatCurrency } from 'react-native-format-currency';

import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { finalizeCurrentReceipt } from '../../../store/round-slice/round-api-actions';
import { ExpirationItem, Item } from '../../../store/round-slice/round-slice-types';
import { removeItemsFromStore } from '../../../store/stores-slice/stores-api-actions';

import ErrorCard from '../../../components/info-cards/ErrorCard';
import Button from '../../../components/ui/Button';
import LabeledItem from '../../../components/ui/LabeledItem';
import colors from '../../../constants/colors';
import fontSizes from '../../../constants/fontSizes';
import { roundActions } from '../../../store/round-slice/round-slice';
import { ReviewProps } from '../../screen-types';
import ReceiptHeader from './ReceiptHeader';
import ReceiptRow, { ReceiptRowProps } from './ReceiptRow';

export default function Review({ navigation }: ReviewProps) {
  const dispatch = useAppDispatch();
  const formatPrice = (amount: number) => formatCurrency({ amount, code: 'HUF' })[0];

  const [saveReceiptError, setSaveReceiptError] = useState<string>('');

  const receiptRows = useAppSelector((state) => {
    const receiptItems = pathOr<Item>({}, ['round', 'currentReceipt', 'items'], state);

    return pipe(
      keys,
      map((itemId) =>
        pipe(
          prop<Record<string, ExpirationItem>>(__, receiptItems),
          keys,
          map((expiresAt) => {
            const item = state.items.data.find((itm) => itm.id === +itemId);
            const netAmount = item.netPrice * receiptItems[itemId][expiresAt].quantity;
            const vatRateNumeric = defaultTo(0, +item.vatRate);
            const vatAmount = Math.round(netAmount * (vatRateNumeric / 100));

            return {
              id: item.id,
              articleNumber: item.articleNumber,
              name: item.name,
              expiresAt,
              quantity: receiptItems[itemId][expiresAt].quantity,
              unitName: item.unitName,
              grossAmount: netAmount + vatAmount,
            };
          })
        )(itemId)
      ),
      flatten,
      sortWith([ascend(prop('name')), ascend(prop('expiresAt'))])
    )(receiptItems);
  });

  const grossAmount = reduce((acc, value) => add(prop('grossAmount', value), acc), 0, receiptRows);

  const removeItemHandler = ({ id, expiresAt }: { id: number; expiresAt: string }) =>
    dispatch(roundActions.removeItem({ id, expiresAt }));

  useEffect(() => {
    if (receiptRows.length === 0) {
      dispatch(roundActions.removeLastUnsentReceipt());
      navigation.reset({
        index: 0,
        routes: [{ name: 'Index' }],
      });
    }
  }, [dispatch, navigation, receiptRows.length]);

  const removeReceiptHandler = () => {
    Alert.alert(
      'Folyamat törlése',
      'Ez a lépés törli a jelenlegi árulevételi munkamenetet és visszairányít a kezdőoldalra. Biztosan folytatni szeretné?',
      [
        { text: 'Mégse' },
        {
          text: 'Biztosan ezt szeretném',
          onPress: () => {
            dispatch(roundActions.removeLastUnsentReceipt());
            navigation.reset({
              index: 0,
              routes: [{ name: 'Index' }],
            });
          },
        },
      ]
    );
  };

  const confirmReceiptHandler = async () => {
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
  };

  const renderReceiptRow: ListRenderItem<ReceiptRowProps['item']> = (
    info: ListRenderItemInfo<ReceiptRowProps['item']>
  ) => <ReceiptRow item={info.item} onRemoveItem={removeItemHandler} />;

  return (
    <View style={styles.container}>
      {!!saveReceiptError && (
        <View style={styles.error}>
          <ErrorCard>{saveReceiptError}</ErrorCard>
        </View>
      )}
      <View style={styles.receiptContainer}>
        <FlatList
          data={receiptRows}
          ListHeaderComponent={ReceiptHeader}
          renderItem={renderReceiptRow}
          keyExtractor={(item) => `${item.id}-${item.expiresAt}`}
        />
      </View>
      <View style={styles.footerContainer}>
        <View style={styles.grossAmountContainer}>
          <LabeledItem label="Mindösszesen" text={formatPrice(grossAmount)} />
        </View>
        <View style={styles.buttonsContainer}>
          <Button variant="ok" onPress={confirmReceiptHandler}>
            Véglegesítés
          </Button>
          <Button variant="warning" onPress={removeReceiptHandler}>
            Elvetés
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
  title: {
    fontWeight: '700',
    textTransform: 'uppercase',
    textDecorationLine: 'underline',
    textDecorationColor: 'white',
  },
  receiptContainer: {
    flex: 1,
    marginTop: 10,
    marginHorizontal: '4%',
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
