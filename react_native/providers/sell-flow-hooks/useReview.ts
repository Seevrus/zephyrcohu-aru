import { assoc, dissoc, identity, isEmpty } from 'ramda';
import { useCallback, useEffect, useMemo, useState } from 'react';

import useItems from '../../api/queries/useItems';
import { Discount } from '../../api/response-types/ItemsResponseType';
import { PriceListType } from '../../api/response-types/PriceListResponseType';
import calculateAmounts from '../../utils/calculateAmounts';
import { SelectedDiscount, useReceiptsContext } from '../ReceiptsProvider';

export type ReviewItem = {
  itemId: number;
  articleNumber: string;
  name: string;
  expirationId: number;
  expiresAt: string;
  quantity: number;
  unitName: string;
  netPrice: number;
  vatRate: string;
  grossAmount: number;
  availableDiscounts: Discount[] | null;
  selectedDiscounts?: SelectedDiscount[];
};

export type UseReview = {
  isLoading: boolean;
  reviewItems: ReviewItem[];
  saveDiscountedItemsInFlow: (itemId: number, discounts?: SelectedDiscount[]) => Promise<void>;
  resetUseReview: () => void;
};

export default function useReview({
  currentPriceList,
  selectedItems,
}: {
  currentPriceList: PriceListType;
  selectedItems: Record<number, Record<number, number>>;
}): UseReview {
  const { data: items, isLoading: isItemsLoading } = useItems();
  const { currentReceipt, setCurrentReceiptItems } = useReceiptsContext();

  const [reviewItems, setReviewItems] = useState<ReviewItem[]>(null);

  const applyDiscounts = useCallback((itemId: number, discounts?: SelectedDiscount[]) => {
    setReviewItems((prevItems) =>
      prevItems.map((item) => {
        if (item.itemId !== itemId) {
          return item;
        }

        if (discounts) {
          return assoc('selectedDiscounts', discounts, item);
        }

        return dissoc('selectedDiscounts', item);
      })
    );
  }, []);

  const saveDiscountedItemsInFlow = useCallback(
    async (itemId: number, discounts?: SelectedDiscount[]) => {
      applyDiscounts(itemId, discounts);

      await setCurrentReceiptItems(
        currentReceipt.items.map((contextReceiptItem) => {
          if (contextReceiptItem.id !== itemId) {
            return contextReceiptItem;
          }

          if (discounts) {
            return assoc('discounts', discounts, contextReceiptItem);
          }

          return dissoc('discounts', contextReceiptItem);
        })
      );
    },
    [applyDiscounts, currentReceipt?.items, setCurrentReceiptItems]
  );

  useEffect(() => {
    setReviewItems((prevItems) => {
      if (!items || isEmpty(selectedItems)) {
        return prevItems;
      }

      return Object.entries(selectedItems)
        .flatMap(([itemId, expirations]) => {
          const item = items.find((i) => i.id === +itemId);

          if (!item) return undefined;

          return Object.entries(expirations)
            .map(([expirationId, quantity]) => {
              const expiration = item.expirations.find((e) => e.id === +expirationId);
              const currentReviewItem = prevItems?.find(
                (i) => i.itemId === +itemId && i.expirationId === +expirationId
              );

              if (!expiration) return undefined;

              const netPrice =
                currentPriceList?.items.find((i) => i.itemId === item.id)?.netPrice ??
                item.netPrice;

              const { grossAmount } = calculateAmounts({
                netPrice,
                quantity,
                vatRate: item.vatRate,
              });

              return {
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
              };
            })
            .filter(identity);
        })
        .filter(identity)
        .sort((item1, item2) => item1.name.localeCompare(item2.name, 'HU-hu'));
    });
  }, [currentPriceList?.items, items, selectedItems]);

  const resetUseReview = useCallback(() => {
    setReviewItems(null);
  }, []);

  return useMemo(
    () => ({
      isLoading: isItemsLoading,
      reviewItems,
      saveDiscountedItemsInFlow,
      resetUseReview,
    }),
    [isItemsLoading, resetUseReview, reviewItems, saveDiscountedItemsInFlow]
  );
}
