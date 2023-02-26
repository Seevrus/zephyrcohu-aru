import {
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
  repeat,
  sortWith,
  __,
} from 'ramda';
import { FlatList, ListRenderItem, ListRenderItemInfo, StyleSheet, View } from 'react-native';

import { useAppSelector } from '../../../store/hooks';
import { ExpirationItem, Item } from '../../../store/round-slice/round-slice-types';

import Button from '../../../components/ui/Button';
import colors from '../../../constants/colors';
import fontSizes from '../../../constants/fontSizes';
import ReceiptRow, { ReceiptRowProps } from './ReceiptRow';

export default function Review() {
  const receiptRows = useAppSelector((state) => {
    const receiptItems = state.round.currentReceipt.items;

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
  }) as unknown as ReceiptRowProps[]; // needed because of addIndex

  const renderReceiptRow: ListRenderItem<ReceiptRowProps> = (
    info: ListRenderItemInfo<ReceiptRowProps>
  ) => <ReceiptRow item={info.item} />;

  return (
    <View style={styles.container}>
      <View style={styles.receiptContainer}>
        <FlatList data={receiptRows} renderItem={renderReceiptRow} />
      </View>
      <View style={styles.footerContainer}>
        <View style={styles.buttonContainer}>
          <Button variant="ok">Számla készítése</Button>
          <Button variant="warning">Törlés</Button>
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
    height: 50,
    marginVertical: 10,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: '7%',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});
