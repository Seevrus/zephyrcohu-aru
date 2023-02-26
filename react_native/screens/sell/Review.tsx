import {
  addIndex,
  ascend,
  assoc,
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
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/ui/buttons/Button';
import colors from '../../constants/colors';
import fontSizes from '../../constants/fontSizes';
import { useAppSelector } from '../../store/hooks';
import { ExpirationItem, Item } from '../../store/round-slice/round-slice-types';

type ReceiptRow = {
  code: string;
  name: string;
  expiresAt: string;
  quantity: number;
  unitName: string;
  netPrice: number;
  netAmount: number;
  vatRate: string;
  vatAmount: number;
  grossAmount: number;
};

export default function Review() {
  // TODO: handle the case with only order items present
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
            const vatRateNumeric = Number.isNaN(+item.vatRate) ? 0 : +item.vatRate;
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
      addIndex<Partial<ReceiptRow>>(map)((item, idx) => {
        const indexLength = String(idx).length;
        const numLeadingZeros = 3 - indexLength;
        const code = join('', repeat('0', numLeadingZeros)) + (idx + 1);
        return assoc('code', code, item);
      })
    )(state);
  }) as unknown as ReceiptRow; // needed because of addIndex

  console.log(receiptRows);

  return (
    <View style={styles.container}>
      <View style={styles.receiptContainer}>
        <FlatList />
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
