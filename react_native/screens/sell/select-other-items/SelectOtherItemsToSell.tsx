import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAtom } from 'jotai';
import {
  assoc,
  dissoc,
  isEmpty,
  isNil,
  isNotNil,
  map,
  pipe,
  prop,
  sortBy,
  take,
} from 'ramda';
import { Suspense, useCallback, useMemo, useState } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  type ListRenderItemInfo,
} from 'react-native';

import { useOtherItems } from '../../../api/queries/useOtherItems';
import { type ReceiptOtherItem } from '../../../api/request-types/common/ReceiptItemsTypes';
import { type BaseItemType } from '../../../api/response-types/common/BaseItemType';
import { currentReceiptAtom } from '../../../atoms/receipts';
import { selectedOtherItemsAtom } from '../../../atoms/sellFlow';
import { Loading } from '../../../components/Loading';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { LabeledItem } from '../../../components/ui/LabeledItem';
import { colors } from '../../../constants/colors';
import { type SelectOtherItemsToSellProps } from '../../../navigators/screen-types';
import { calculateAmounts } from '../../../utils/calculateAmounts';
import { formatPrice } from '../../../utils/formatPrice';
import { ExpirationAccordionDetails } from './ExpirationAccordionDetails';

export type OtherSellItem = {
  id: number;
  name: string;
  netPrice: number;
  vatRate: string;
};

type OtherSellItems = OtherSellItem[];

const NUM_ITEMS_SHOWN = 10;

function SuspendedSelectOtherItemsToSell({
  navigation,
}: SelectOtherItemsToSellProps) {
  const { data: otherItems, isPending: isOtherItemsPending } = useOtherItems();

  const [, setCurrentReceipt] = useAtom(currentReceiptAtom);
  const [selectedOtherItems, setSelectedOtherItems] = useAtom(
    selectedOtherItemsAtom
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const otherSellItems: OtherSellItems = useMemo(
    () =>
      pipe(
        map<BaseItemType, OtherSellItem>((item) => ({
          id: item.id,
          name: item.name,
          netPrice: item.netPrice,
          vatRate: item.vatRate,
        })),
        sortBy(prop('name')),
        (otherItems) => take<OtherSellItem>(NUM_ITEMS_SHOWN, otherItems)
      )(otherItems ?? []),
    [otherItems]
  );

  const [netTotal, grossTotal] = useMemo(
    () =>
      Object.entries(selectedOtherItems).reduce(
        (prev, curr) => {
          const [prevNetAmount, prevGrossAmount] = prev;
          const [itemId, { netPrice: userNetPrice, quantity }] = curr;

          const currentItem = otherItems?.find((item) => item.id === +itemId);

          if (!currentItem || quantity === null) {
            return prev;
          }

          const { netPrice, vatRate } = currentItem;
          const { netAmount, grossAmount } = calculateAmounts({
            netPrice: userNetPrice ?? netPrice,
            quantity,
            vatRate,
          });

          return [prevNetAmount + netAmount, prevGrossAmount + grossAmount];
        },
        [0, 0]
      ),
    [otherItems, selectedOtherItems]
  );

  const setCurrentReceiptOtherItems = useCallback(
    async (otherItems?: ReceiptOtherItem[]) => {
      if (otherItems) {
        setCurrentReceipt(async (currentReceiptPromise) => ({
          ...(await currentReceiptPromise),
          otherItems,
        }));
      } else {
        setCurrentReceipt(async (currentReceiptPromise) => ({
          ...(await currentReceiptPromise),
          otherItems: undefined,
        }));
      }
    },
    [setCurrentReceipt]
  );

  const saveSelectedOtherItemsInFlow = useCallback(async () => {
    const currentReceiptOtherItems = otherItems
      ?.map<ReceiptOtherItem | undefined>((otherItem) => {
        const selectedOtherItem = selectedOtherItems[otherItem.id];

        if (!selectedOtherItem) {
          return;
        }

        const { netPrice, quantity, comment } = selectedOtherItem;

        if (!quantity) {
          return;
        }

        const { netAmount, vatAmount, grossAmount } = calculateAmounts({
          netPrice: netPrice ?? otherItem.netPrice,
          quantity: quantity,
          vatRate: otherItem.vatRate,
        });

        return {
          id: otherItem.id,
          articleNumber: otherItem.articleNumber,
          name: otherItem.name,
          quantity,
          unitName: otherItem.unitName,
          netPrice: netPrice ?? otherItem.netPrice,
          netAmount,
          vatRate: otherItem.vatRate,
          vatAmount,
          grossAmount,
          comment: comment ?? undefined,
        };
      })
      .filter((item): item is ReceiptOtherItem => !!item);

    await (isEmpty(currentReceiptOtherItems)
      ? setCurrentReceiptOtherItems()
      : setCurrentReceiptOtherItems(currentReceiptOtherItems));
  }, [otherItems, selectedOtherItems, setCurrentReceiptOtherItems]);

  const canConfirmItems = Object.values(selectedOtherItems)?.some(
    (oi) => !!oi?.quantity
  );
  const confirmButtonVariant = canConfirmItems ? 'ok' : 'disabled';
  const confirmItemsHandler = useCallback(async () => {
    if (canConfirmItems) {
      setIsLoading(true);
      await saveSelectedOtherItemsInFlow();
      setIsLoading(false);
      navigation.goBack();
    }
  }, [canConfirmItems, navigation, saveSelectedOtherItemsInFlow]);

  const priceChangeHandler = useCallback(
    (item: OtherSellItem, netPrice: number | null) => {
      setSelectedOtherItems((prevItems) => {
        const netPriceOrUndefined = isNotNil(netPrice) ? netPrice : undefined;
        const selectedOtherItem = prevItems[item.id];

        if (!selectedOtherItem) {
          return assoc(item.id, { netPrice: netPriceOrUndefined }, prevItems);
        }

        if (
          isNil(netPrice) &&
          isNil(selectedOtherItem.quantity) &&
          isNil(selectedOtherItem.comment)
        ) {
          return dissoc(item.id, prevItems);
        }

        return assoc(
          item.id,
          { ...selectedOtherItem, netPrice: netPriceOrUndefined },
          prevItems
        );
      });
    },
    [setSelectedOtherItems]
  );

  const quantityChangeHandler = useCallback(
    (item: OtherSellItem, quantity: number | null) => {
      setSelectedOtherItems((prevItems) => {
        const quantityOrUndefined = isNotNil(quantity) ? quantity : undefined;
        const selectedOtherItem = prevItems[item.id];

        if (!selectedOtherItem) {
          return assoc(item.id, { quantity: quantityOrUndefined }, prevItems);
        }

        if (
          isNil(selectedOtherItem.netPrice) &&
          isNil(quantity) &&
          isNil(selectedOtherItem.comment)
        ) {
          return dissoc(item.id, prevItems);
        }

        return assoc(
          item.id,
          { ...selectedOtherItem, quantity: quantityOrUndefined },
          prevItems
        );
      });
    },
    [setSelectedOtherItems]
  );

  const commentChangeHandler = useCallback(
    (item: OtherSellItem, comment: string | null) => {
      setSelectedOtherItems((prevItems) => {
        const commentOrUndefined = isNotNil(comment) ? comment : undefined;
        const selectedOtherItem = prevItems[item.id];

        if (!selectedOtherItem) {
          return assoc(item.id, { comment: commentOrUndefined }, prevItems);
        }

        if (
          isNil(selectedOtherItem.netPrice) &&
          isNil(selectedOtherItem.quantity) &&
          isNil(comment)
        ) {
          return dissoc(item.id, prevItems);
        }

        return assoc(
          item.id,
          { ...selectedOtherItem, comment: commentOrUndefined },
          prevItems
        );
      });
    },
    [setSelectedOtherItems]
  );

  const renderItem = useCallback(
    (info: ListRenderItemInfo<OtherSellItem>) => (
      <ExpirationAccordionDetails
        item={info.item}
        netPrice={
          selectedOtherItems[info.item.id]?.netPrice ??
          info.item.netPrice ??
          null
        }
        setNetPrice={priceChangeHandler}
        quantity={selectedOtherItems[info.item.id]?.quantity ?? null}
        setQuantity={quantityChangeHandler}
        comment={selectedOtherItems[info.item.id]?.comment ?? null}
        setComment={commentChangeHandler}
      />
    ),
    [
      commentChangeHandler,
      priceChangeHandler,
      quantityChangeHandler,
      selectedOtherItems,
    ]
  );

  if (isLoading || isOtherItemsPending) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.searchInputContainer}>
          <MaterialCommunityIcons name="magnify" size={30} color="white" />
          <Input
            label=""
            labelPosition="left"
            value={searchTerm}
            config={{ onChangeText: setSearchTerm }}
          />
        </View>
      </View>
      <View style={styles.listContainer}>
        <Animated.FlatList
          data={otherSellItems}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
        />
      </View>
      <View style={styles.footerContainer}>
        <View style={styles.summaryContainer}>
          <LabeledItem
            label="Összesen"
            text={`${formatPrice(netTotal)} / ${formatPrice(grossTotal)}`}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button variant={confirmButtonVariant} onPress={confirmItemsHandler}>
            Kiválaszott tételek hozzáadása
          </Button>
        </View>
      </View>
    </View>
  );
}

export function SelectOtherItemsToSell(props: SelectOtherItemsToSellProps) {
  return (
    <Suspense>
      <SuspendedSelectOtherItemsToSell {...props} />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  footerContainer: {
    backgroundColor: colors.neutral,
    borderTopColor: colors.white,
    borderTopWidth: 2,
    height: 135,
    paddingVertical: 10,
  },
  headerContainer: {
    height: 65,
    marginVertical: 10,
  },
  listContainer: {
    flex: 1,
  },
  searchInputContainer: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: '7%',
  },
  summaryContainer: {
    alignItems: 'flex-end',
    marginBottom: 10,
    marginHorizontal: '7%',
  },
});
