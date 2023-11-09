import { type BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
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
import { useCallback, useMemo, useState } from 'react';

import { useOtherItems } from '../../../api/queries/useOtherItems';
import { type ReceiptOtherItem } from '../../../api/request-types/common/ReceiptItemsTypes';
import { type BaseItemType } from '../../../api/response-types/common/BaseItemType';
import { currentReceiptAtom } from '../../../atoms/receipts';
import { selectedOtherItemsAtom } from '../../../atoms/sellFlow';
import { type StackParams } from '../../../navigators/screen-types';
import { calculateAmounts } from '../../../utils/calculateAmounts';

export type OtherSellItem = {
  id: number;
  name: string;
  netPrice: number;
  vatRate: string;
};

type OtherSellItems = OtherSellItem[];

const NUM_ITEMS_SHOWN = 10;

export function useSelectOtherItemsToSellData(
  navigation: BottomTabNavigationProp<
    StackParams,
    'SelectOtherItemsToSell',
    undefined
  >
) {
  const { data: otherItems, isPending: isOtherItemsPending } = useOtherItems();

  const [, setCurrentReceipt] = useAtom(currentReceiptAtom);
  const [selectedOtherItems, setSelectedOtherItems] = useAtom(
    selectedOtherItemsAtom
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);

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

          if (!currentItem || isNil(quantity)) {
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

  const saveSelectedOtherItemsInFlow = useCallback(async () => {
    const setCurrentReceiptOtherItems = async (
      otherItems: ReceiptOtherItem[] | undefined
    ) => {
      await setCurrentReceipt(async (currentReceiptPromise) => ({
        ...(await currentReceiptPromise),
        otherItems,
      }));
    };

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
      ? setCurrentReceiptOtherItems(undefined)
      : setCurrentReceiptOtherItems(currentReceiptOtherItems));
  }, [otherItems, selectedOtherItems, setCurrentReceipt]);

  const canConfirmItems = Object.values(selectedOtherItems)?.some(
    (oi) => !!oi?.quantity
  );

  const confirmItemsHandler = useCallback(async () => {
    if (canConfirmItems) {
      setIsLoading(true);
      await saveSelectedOtherItemsInFlow();
      setIsLoading(false);
      navigation.goBack();
    }
  }, [canConfirmItems, navigation, saveSelectedOtherItemsInFlow]);

  return {
    isLoading: isLoading || isOtherItemsPending,
    otherItems: otherSellItems,
    priceChangeHandler,
    quantityChangeHandler,
    commentChangeHandler,
    netTotal,
    grossTotal,
    canConfirmItems,
    confirmItemsHandler,
  };
}
