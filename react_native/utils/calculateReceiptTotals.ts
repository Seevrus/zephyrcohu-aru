import { groupBy, map, prop, values } from 'ramda';

import { ReceiptItem, ReceiptOtherItem } from '../api/request-types/common/ReceiptItemsTypes';
import { ReceiptVatAmount } from '../api/request-types/common/ReceiptVatAmount';
import { SelectedDiscount } from '../providers/types/receipts-provider-types';
import calculateDiscountedItemAmounts from './calculateDiscountedItemAmounts';

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

  const receiptVatAmountsByVatRate = map((itemsUnderOneVatRate) => {
    const { netAmount, vatAmount, grossAmount } = reduceAmounts(itemsUnderOneVatRate);

    return {
      vatRate: itemsUnderOneVatRate[0].vatRate,
      netAmount,
      vatAmount,
      grossAmount,
    };
  }, itemsByVatRate);

  return values(receiptVatAmountsByVatRate);
}

type ReceiptTotals = {
  quantity: number;
  netAmount: number;
  vatAmount: number;
  grossAmount: number;
  vatAmounts: ReceiptVatAmount[];
};

export default function calculateReceiptTotals({
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
