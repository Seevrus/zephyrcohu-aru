import { groupBy, map, prop } from 'ramda';

import {
  type ReceiptItem,
  type ReceiptOtherItem,
} from '../api/request-types/common/ReceiptItemsTypes';
import { type ReceiptVatAmount } from '../api/request-types/common/ReceiptVatAmount';
import { type SelectedDiscount } from '../atoms/receipts';
import { calculateDiscountedItemAmounts } from './calculateDiscountedItemAmounts';

type Item = {
  netPrice: number;
  quantity: number;
  vatRate: string;
  selectedDiscounts?: SelectedDiscount[];
};

function reduceAmounts(items: Item[]) {
  return items.reduce(
    (prev, curr) => {
      const discountedItemAmounts = calculateDiscountedItemAmounts(curr);

      return {
        quantity: prev.quantity + curr.quantity,
        netAmount: prev.netAmount + discountedItemAmounts.netAmount,
        vatAmount: prev.vatAmount + discountedItemAmounts.vatAmount,
        grossAmount: prev.grossAmount + discountedItemAmounts.grossAmount,
      };
    },
    { quantity: 0, netAmount: 0, vatAmount: 0, grossAmount: 0 }
  );
}

function calculateVatAmounts(items: Item[]): ReceiptVatAmount[] {
  const itemsByVatRate = groupBy(prop('vatRate'), items);

  const receiptVatAmountsByVatRate: Record<
    string,
    ReceiptVatAmount | undefined
  > = map((itemsUnderOneVatRate) => {
    if (!itemsUnderOneVatRate) {
      return;
    }

    const { netAmount, vatAmount, grossAmount } =
      reduceAmounts(itemsUnderOneVatRate);

    return {
      vatRate: itemsUnderOneVatRate[0].vatRate,
      netAmount,
      vatAmount,
      grossAmount,
    };
  }, itemsByVatRate);

  return Object.values(receiptVatAmountsByVatRate).filter(
    (amount): amount is ReceiptVatAmount => !!amount
  );
}

type ReceiptTotals = {
  quantity: number;
  netAmount: number;
  vatAmount: number;
  grossAmount: number;
  vatAmounts: ReceiptVatAmount[];
};

export function calculateReceiptTotals({
  items,
  otherItems,
}: {
  items: ReceiptItem[];
  otherItems: ReceiptOtherItem[] | undefined;
}): ReceiptTotals {
  const allItems = [...items, ...(otherItems ?? [])];

  return {
    ...reduceAmounts(allItems),
    vatAmounts: calculateVatAmounts(allItems),
  };
}
