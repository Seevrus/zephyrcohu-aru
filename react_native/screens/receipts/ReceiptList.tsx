import {
  ascend,
  defaultTo,
  flatten,
  keys,
  map,
  pipe,
  prop,
  reduce,
  sortWith,
  when,
  __,
} from 'ramda';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../../components/ui/Button';
import colors from '../../constants/colors';
import fontSizes from '../../constants/fontSizes';
import { useAppSelector } from '../../store/hooks';
import { ExpirationItem } from '../../store/round-slice/round-slice-types';
import { ReceiptListProps } from '../screen-types';

type ReceiptSummaryListItem = {
  id: number;
  articleNumber: string;
  name: string;
  expiresAt: string; // yyyy-MM
  quantity: number;
  unitName: string;
  grossAmount: number;
};

type ReceiptSummaryList = {
  receiptNr: string;
  deliveryName: string;
  items: ReceiptSummaryListItem[];
  total: number;
};

export default function ReceiptList({ navigation }: ReceiptListProps) {
  const onPressNextHandler = () => {
    navigation.navigate('Receipt');
  };

  const receiptSummaryList: ReceiptSummaryList = useAppSelector((state) => {
    const { store } = state.stores;
    const { receipts } = state.round;

    return receipts.map((receipt) => {
      const partner = state.partners.partners.find((p) => p.id === receipt.partnerId);
      const priceList = partner?.priceList || {};

      const receiptNr = `${receipt.serialNumber}/${store.yearCode}`;
      const deliveryName = partner.locations.D?.name;
      const receiptItems = receipt?.items ?? {};
      const displayedItems = pipe(
        keys,
        map((itemId) =>
          pipe(
            prop<Record<string, ExpirationItem>>(__, receiptItems),
            keys,
            map((expiresAt) => {
              const item = state.items.data.find((itm) => itm.id === +itemId);
              const priceListItem = priceList[item.id];
              const netPrice = priceListItem?.netPrice || item.netPrice;
              const netAmount = netPrice * receiptItems[itemId][expiresAt].quantity;
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

      const total = pipe(
        reduce<ReceiptSummaryListItem, number>((acc, value) => acc + value.grossAmount, 0),
        when(
          () => partner.paymentDays === 0,
          (t) => Math.round(t / 5) * 5
        )
      )(displayedItems);

      return {
        receiptNr,
        deliveryName,
        items: displayedItems,
        total,
      };
    });
  });

  console.log(receiptSummaryList);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Itt listázzuk a már elkészült bizonylatokat. Rájuk kattintva kiderülnek részletek egy másik
        képernyőn, ahol majd sztornózni is lehet.
      </Text>
      <Text style={styles.text}>A Vissza gomb a Kör képernyőre vezet.</Text>
      <View style={styles.buttonContainer}>
        <Button variant="ok" onPress={onPressNextHandler}>
          Tovább
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  text: {
    color: 'white',
    fontFamily: 'Muli',
    fontSize: fontSizes.body,
  },
  buttonContainer: {
    marginTop: 30,
    height: 150,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
