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
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native';

import { useAppSelector } from '../../store/hooks';
import { ExpirationItem } from '../../store/round-slice/round-slice-types';
import { ReceiptListProps } from '../../navigators/screen-types';

import colors from '../../constants/colors';
import fontSizes from '../../constants/fontSizes';
import ReceiptListItem from './ReceiptListItem';

type ReceiptSummaryItem = {
  id: number;
  articleNumber: string;
  name: string;
  expiresAt: string; // yyyy-MM
  quantity: number;
  unitName: string;
  grossAmount: number;
};

type ReceiptSummary = {
  serialNumber: number;
  yearCode: number;
  deliveryName: string;
  items: ReceiptSummaryItem[];
  total: number;
};

export default function ReceiptList({ navigation }: ReceiptListProps) {
  const receiptSummaryList: ReceiptSummary[] = useAppSelector((state) => {
    const { store } = state.stores;
    const { receipts } = state.round;

    return receipts.map((receipt) => {
      const partner = state.partners.partners.find((p) => p.id === receipt.partnerId);
      const priceList = partner?.priceList || {};

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
        reduce<ReceiptSummaryItem, number>((acc, value) => acc + value.grossAmount, 0),
        when(
          () => partner.paymentDays === 0,
          (t) => Math.round(t / 5) * 5
        )
      )(displayedItems);

      return {
        serialNumber: receipt.serialNumber,
        yearCode: store.yearCode,
        deliveryName,
        items: displayedItems,
        total,
      };
    });
  });

  const receiptListItemPressHandler = (serialNumber: number) => {
    navigation.navigate('ReceiptDetails', { serialNumber });
  };

  const renderReceiptListItem = (info: ListRenderItemInfo<ReceiptSummary>) => (
    <ReceiptListItem
      partnerName={info.item.deliveryName}
      serialNumber={info.item.serialNumber}
      yearCode={info.item.yearCode}
      total={info.item.total}
      onPress={receiptListItemPressHandler}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={receiptSummaryList}
        keyExtractor={(item) => String(item.serialNumber)}
        renderItem={renderReceiptListItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: '7%',
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
