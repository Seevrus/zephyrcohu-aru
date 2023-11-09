import { dissoc, mergeLeft, prepend } from 'ramda';

import { type ReceiptItem } from '../api/request-types/common/ReceiptItemsTypes';
import { type ContextReceiptItem } from '../atoms/receipts';
import { calculateAmounts } from './calculateAmounts';

export function createUniqueDiscountedItems(
  items: ContextReceiptItem[]
): ReceiptItem[] {
  return items.flatMap<ReceiptItem>((contextItem) => {
    const contextItemWithoutDiscounts = dissoc(
      'selectedDiscounts',
      contextItem
    );

    if (!contextItem.selectedDiscounts) {
      return contextItemWithoutDiscounts;
    }

    const discountedItems: ReceiptItem[] = contextItem.selectedDiscounts.map(
      (selectedDiscount) => {
        let newNetPrice: number;
        switch (selectedDiscount.type) {
          case 'absolute': {
            newNetPrice = contextItem.netPrice - selectedDiscount.amount;
            break;
          }
          case 'percentage': {
            newNetPrice =
              contextItem.netPrice * (100 - selectedDiscount.amount);
            break;
          }
          case 'freeForm': {
            newNetPrice = selectedDiscount.price ?? 1;
            break;
          }
          default: {
            newNetPrice = selectedDiscount;
          }
        }

        const discountAmounts = calculateAmounts({
          netPrice: newNetPrice,
          quantity: selectedDiscount.quantity,
          vatRate: contextItem.vatRate,
        });

        return mergeLeft(
          {
            discountName: selectedDiscount.name,
            quantity: selectedDiscount.quantity,
            ...discountAmounts,
          },
          contextItemWithoutDiscounts
        );
      }
    );

    const discountedQuantity = discountedItems.reduce(
      (prevQuantity, discountedItem) => prevQuantity + discountedItem.quantity,
      0
    );

    if (discountedQuantity === contextItem.quantity) {
      return discountedItems;
    }

    const notDiscountedItem = mergeLeft(
      {
        quantity: contextItem.quantity - discountedQuantity,
      },
      contextItemWithoutDiscounts
    );

    return prepend(notDiscountedItem, discountedItems);
  });
}
