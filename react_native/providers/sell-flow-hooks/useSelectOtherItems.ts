import { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react';
import { identity, isEmpty, map, pipe, prop, sortBy } from 'ramda';

import useOtherItems from '../../api/queries/useOtherItems';
import { BaseItemType } from '../../api/response-types/common/BaseItemType';
import { useReceiptsContext } from '../ReceiptsProvider';
import calculateAmounts from '../../utils/calculateAmounts';

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

export default function useSelectOtherItems(): UseSelectOtherItems {
  const { data: otherItems, isPending: isOtherItemsPending } = useOtherItems();
  const { isPending: isReceiptsContextPending, setCurrentReceiptOtherItems } = useReceiptsContext();

  const [selectedOtherItems, setSelectedOtherItems] = useState<SelectedOtherItems>({});

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
          return undefined;
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

    if (isEmpty(currentReceiptOtherItems)) {
      await setCurrentReceiptOtherItems();
    } else {
      await setCurrentReceiptOtherItems(currentReceiptOtherItems);
    }
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
