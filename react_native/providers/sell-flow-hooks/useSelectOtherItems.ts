import { identity, isEmpty, map, pipe, prop, sortBy } from 'ramda';
import {
  useCallback,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';

import { useOtherItems } from '../../api/queries/useOtherItems';
import { type BaseItemType } from '../../api/response-types/common/BaseItemType';
import { calculateAmounts } from '../../utils/calculateAmounts';
import { useReceiptsContext } from '../ReceiptsProvider';

export type OtherSellItem = {
  id: number;
  name: string;
  netPrice: number;
  vatRate: string;
};

type OtherSellItems = OtherSellItem[];

export type SelectedOtherItems = Record<
  number,
  {
    netPrice: number | null;
    quantity: number | null;
    comment: string | null;
  }
>;

export type UseSelectOtherItems = {
  isPending: boolean;
  otherItems: OtherSellItems;
  selectedOtherItems: SelectedOtherItems;
  setSelectedOtherItems: Dispatch<SetStateAction<SelectedOtherItems>>;
  saveSelectedOtherItemsInFlow: () => Promise<void>;
  resetUseSelectOtherItems: () => void;
};

export function useSelectOtherItems(): UseSelectOtherItems {
  const { data: otherItems, isPending: isOtherItemsPending } = useOtherItems();
  const { isPending: isReceiptsContextPending, setCurrentReceiptOtherItems } =
    useReceiptsContext();

  const [selectedOtherItems, setSelectedOtherItems] =
    useState<SelectedOtherItems>({});

  const otherSellItems = useMemo(
    () =>
      pipe(
        map<BaseItemType, OtherSellItem>((item) => ({
          id: item.id,
          name: item.name,
          netPrice: item.netPrice,
          vatRate: item.vatRate,
        })),
        sortBy(prop('name'))
      )(otherItems ?? []) satisfies OtherSellItems,
    [otherItems]
  );

  const saveSelectedOtherItemsInFlow = useCallback(async () => {
    const currentReceiptOtherItems = otherItems
      .map((otherItem) => {
        const selectedOtherItem = selectedOtherItems[otherItem.id];

        if (!selectedOtherItem) {
          return;
        }

        const { netPrice, quantity, comment } = selectedOtherItem;

        const { netAmount, vatAmount, grossAmount } = calculateAmounts({
          netPrice: netPrice ?? otherItem.netPrice,
          quantity,
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
          comment,
        };
      })
      .filter(identity);

    await (isEmpty(currentReceiptOtherItems)
      ? setCurrentReceiptOtherItems()
      : setCurrentReceiptOtherItems(currentReceiptOtherItems));
  }, [otherItems, selectedOtherItems, setCurrentReceiptOtherItems]);

  const resetUseSelectOtherItems = useCallback(() => {
    setSelectedOtherItems({});
  }, []);

  return useMemo(
    () => ({
      isPending: isOtherItemsPending || isReceiptsContextPending,
      otherItems: otherSellItems,
      selectedOtherItems,
      setSelectedOtherItems,
      saveSelectedOtherItemsInFlow,
      resetUseSelectOtherItems,
    }),
    [
      isOtherItemsPending,
      isReceiptsContextPending,
      otherSellItems,
      resetUseSelectOtherItems,
      saveSelectedOtherItemsInFlow,
      selectedOtherItems,
    ]
  );
}
