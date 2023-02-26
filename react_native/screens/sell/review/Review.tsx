import {
  add,
  addIndex,
  ascend,
  assoc,
  defaultTo,
  flatten,
  join,
  keys,
  map,
  pathOr,
  pipe,
  prop,
  reduce,
  repeat,
  sortWith,
  __,
} from 'ramda';
import { useEffect } from 'react';
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
import { ExpirationItem, Item } from '../../../store/round-slice/round-slice-types';

import Button from '../../../components/ui/Button';
import colors from '../../../constants/colors';
import fontSizes from '../../../constants/fontSizes';
import ReceiptRow, { ReceiptRowProps } from './ReceiptRow';
import { roundActions } from '../../../store/round-slice/round-slice';
import LabeledItem from '../../../components/ui/LabeledItem';
import { ReviewProps } from '../../screen-types';

export default function Review({ navigation }: ReviewProps) {
  const dispatch = useAppDispatch();
  const formatPrice = (amount: number) => formatCurrency({ amount, code: 'HUF' })[0];

  const receiptRows = useAppSelector((state) => {
    const receiptItems = state.round.currentReceipt?.items;

    return pipe(
      pathOr<Item>({}, ['round', 'currentReceipt', 'items']),
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
              id: itemId,
              name: receiptItems[itemId][expiresAt].name,
              expiresAt,
              quantity: receiptItems[itemId][expiresAt].quantity,
              unitName: item.unitName,
              netPrice: item.netPrice,
              netAmount,
              vatRate: item.vatRate,
              vatAmount,
              grossAmount: netAmount + vatAmount,
            };
          })
        )(itemId)
      ),
      flatten,
      sortWith([ascend(prop('name')), ascend(prop('expiresAt'))]),
      addIndex<Partial<ReceiptRowProps[]>>(map)((item, idx) => {
        const indexLength = String(idx).length;
        const numLeadingZeros = 3 - indexLength;
        const code = join('', repeat('0', numLeadingZeros)) + (idx + 1);
        return assoc('code', code, item);
      })
    )(state);
  }) as unknown as ReceiptRowProps['item'][]; // needed because of addIndex

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

  const renderReceiptRow: ListRenderItem<ReceiptRowProps['item']> = (
    info: ListRenderItemInfo<ReceiptRowProps['item']>
  ) => <ReceiptRow item={info.item} onRemoveItem={removeItemHandler} />;

  return (
    <View style={styles.container}>
      <View style={styles.receiptContainer}>
        <FlatList
          data={receiptRows}
          renderItem={renderReceiptRow}
          keyExtractor={(item) => `${item.id}-${item.expiresAt}`}
        />
      </View>
      <View style={styles.footerContainer}>
        <View style={styles.grossAmountContainer}>
          <LabeledItem label="Bruttó összeg" text={formatPrice(grossAmount)} />
        </View>
        <View style={styles.buttonsContainer}>
          <Button variant="ok">Számla készítése</Button>
          <Button variant="warning" onPress={removeReceiptHandler}>
            Törlés
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

  title: {
    fontWeight: '700',
    textTransform: 'uppercase',
    textDecorationLine: 'underline',
    textDecorationColor: 'white',
  },
  receiptContainer: {
    flex: 1,
    marginTop: 10,
    marginHorizontal: '7%',
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
    borderTopColor: 'white',
    borderTopWidth: 2,
  },
  grossAmountContainer: {
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
