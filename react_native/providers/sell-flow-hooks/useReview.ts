import { and, assoc, dissoc, identity, isEmpty } from 'ramda';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useItems } from '../../api/queries/itemsAtom';
import { useOtherItems } from '../../api/queries/useOtherItems';
import { type Discount } from '../../api/response-types/ItemsResponseType';
import { type PriceListType } from '../../api/response-types/PriceListResponseType';
import { calculateAmounts } from '../../utils/calculateAmounts';
import { useOrdersContext } from '../OrdersProvider';
import { useReceiptsContext } from '../ReceiptsProvider';
import { useStorageContext } from '../StorageProvider';
import { type SelectedDiscount } from '../types/receipts-provider-types';
import { type SelectedOtherItems } from './useSelectOtherItems';

type BaseReviewItem = {
  itemId: number;
  articleNumber: string;
  name: string;
  quantity: number;
  unitName: string;
  netPrice: number;
  vatRate: string;
  grossAmount: number;
};

export type RegularReviewItem = BaseReviewItem & {
  type: 'item';
  expirationId: number;
  expiresAt: string;
  availableDiscounts: Discount[] | null;
  selectedDiscounts?: SelectedDiscount[];
};

export type OtherReviewItem = BaseReviewItem & {
  type: 'otherItem';
  comment: string;
  selectedDiscounts?: undefined;
};

export type ReviewItem = RegularReviewItem | OtherReviewItem;

export type UseReview = {
  isPending: boolean;
  reviewItems: ReviewItem[];
  saveDiscountedItemsInFlow: (
    itemId: number,
    discounts?: SelectedDiscount[]
  ) => Promise<void>;
  resetUseReview: () => void;
  finishReview: () => Promise<void>;
};

export function useReview({
  currentPriceList,
  selectedItems,
  selectedOtherItems,
}: {
  currentPriceList: PriceListType;
  selectedItems: Record<number, Record<number, number>>;
  selectedOtherItems: SelectedOtherItems;
}): UseReview {
  const { data: items, isPending: isItemsPending } = useItems();
  const { data: otherItems, isPending: isOtherItemsPending } = useOtherItems();
  const { isPending: isOrdersContextPending, finalizeCurrentOrder } =
    useOrdersContext();
  const {
    isPending: isReceiptsContextPending,
    currentReceipt,
    setCurrentReceiptItems,
    finalizeCurrentReceipt,
  } = useReceiptsContext();
  const { isPending: isStorageContextPending, removeSoldItemsFromStorage } =
    useStorageContext();

  const [reviewItems, setReviewItems] = useState<ReviewItem[]>(null);

  const applyDiscounts = useCallback(
    (itemId: number, discounts?: SelectedDiscount[]) => {
      setReviewItems((prevItems) =>
        prevItems.map((item) => {
          if (item.itemId !== itemId || item.type !== 'item') {
            return item;
          }

          if (discounts) {
            return assoc('selectedDiscounts', discounts, item);
          }

          return dissoc('selectedDiscounts', item);
        })
      );
    },
    []
  );

  const saveDiscountedItemsInFlow = useCallback(
    async (itemId: number, discounts?: SelectedDiscount[]) => {
      applyDiscounts(itemId, discounts);

      await setCurrentReceiptItems(
        currentReceipt.items.map((contextReceiptItem) => {
          if (contextReceiptItem.id !== itemId) {
            return contextReceiptItem;
          }

          if (discounts) {
            return assoc('selectedDiscounts', discounts, contextReceiptItem);
          }

          return dissoc('selectedDiscounts', contextReceiptItem);
        })
      );
    },
    [applyDiscounts, currentReceipt?.items, setCurrentReceiptItems]
  );

  useEffect(() => {
    setReviewItems((prevItems) => {
      if (
        !items ||
        !otherItems ||
        and(isEmpty(selectedItems), isEmpty(selectedOtherItems))
      ) {
        return prevItems;
      }

      const regularReviewItems: RegularReviewItem[] = Object.entries(
        selectedItems
      )
        .flatMap(([itemId, expirations]) => {
          const item = items.find((index) => index.id === +itemId);

          if (!item) {
            return;
          }

          return Object.entries(expirations)
            .map(([expirationId, quantity]) => {
              const expiration = item.expirations.find(
                (exp) => exp.id === +expirationId
              );
              const currentReviewItem = prevItems?.find(
                (index) =>
                  index.itemId === +itemId &&
                  index.type === 'item' &&
                  index.expirationId === +expirationId
              );

              if (!expiration) {
                return;
              }

              const netPrice =
                currentPriceList?.items.find(
                  (index) => index.itemId === item.id
                )?.netPrice ?? item.netPrice;

              const { grossAmount } = calculateAmounts({
                netPrice,
                quantity,
                vatRate: item.vatRate,
              });

              return {
                type: 'item',
                itemId: item.id,
                articleNumber: item.articleNumber,
                name: item.name,
                expirationId: expiration.id,
                expiresAt: expiration.expiresAt,
                quantity,
                unitName: item.unitName,
                netPrice,
                vatRate: item.vatRate,
                grossAmount,
                availableDiscounts: item.discounts,
                selectedDiscounts: currentReviewItem?.selectedDiscounts,
              } as const;
            })
            .filter(identity);
        })
        .filter(identity)
        .sort((item1, item2) => item1.name.localeCompare(item2.name, 'HU-hu'));

      const otherReviewItems: OtherReviewItem[] = Object.entries(
        selectedOtherItems
      )
        .map(([otherItemId, { netPrice, quantity, comment }]) => {
          const otherItem = otherItems.find(
            (index) => index.id === +otherItemId
          );

          if (!otherItem) {
            return;
          }

          const { grossAmount } = calculateAmounts({
            netPrice: netPrice ?? otherItem.netPrice,
            quantity,
            vatRate: otherItem.vatRate,
          });

          return {
            type: 'otherItem',
            itemId: otherItem.id,
            articleNumber: otherItem.articleNumber,
            name: otherItem.name,
            quantity,
            unitName: otherItem.unitName,
            netPrice: netPrice ?? otherItem.netPrice,
            vatRate: otherItem.vatRate,
            grossAmount,
            comment,
          } as const;
        })
        .filter(identity);

      return [...regularReviewItems, ...otherReviewItems];
    });
  }, [
    currentPriceList?.items,
    items,
    otherItems,
    selectedItems,
    selectedOtherItems,
  ]);

  const resetUseReview = useCallback(() => {
    setReviewItems(null);
  }, []);

  const finishReview = useCallback(async () => {
    await finalizeCurrentOrder();
    await finalizeCurrentReceipt();
    await removeSoldItemsFromStorage(selectedItems);
  }, [
    finalizeCurrentOrder,
    finalizeCurrentReceipt,
    removeSoldItemsFromStorage,
    selectedItems,
  ]);

  return useMemo(
    () => ({
      isPending:
        isOrdersContextPending ||
        isReceiptsContextPending ||
        isStorageContextPending ||
        isItemsPending ||
        isOtherItemsPending,
      reviewItems,
      saveDiscountedItemsInFlow,
      resetUseReview,
      finishReview,
    }),
    [
      finishReview,
      isItemsPending,
      isOrdersContextPending,
      isOtherItemsPending,
      isReceiptsContextPending,
      isStorageContextPending,
      resetUseReview,
      reviewItems,
      saveDiscountedItemsInFlow,
    ]
  );
}
