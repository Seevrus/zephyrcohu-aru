import { type SelectedDiscount } from '../providers/types/receipts-provider-types';
import { calculateAmounts } from './calculateAmounts';

type Item = {
  netPrice: number;
  quantity: number;
  vatRate: string;
  selectedDiscounts?: SelectedDiscount[];
};

export function calculateDiscountedItemAmounts({
  netPrice,
  quantity,
  vatRate,
  selectedDiscounts,
}: Item) {
  if (!selectedDiscounts) {
    return calculateAmounts({ netPrice, quantity, vatRate });
  }

  const {
    discountedQuantity,
    discountedNetAmount,
    discountedVatAmount,
    discountedGrossAmount,
  } = selectedDiscounts.reduce(
    (prev, discount) => {
      let newNetPrice: number;
      switch (discount.type) {
        case 'absolute': {
          newNetPrice = netPrice - discount.amount;
          break;
        }
        case 'percentage': {
          newNetPrice = netPrice * (100 - discount.amount);
          break;
        }
        case 'freeForm': {
          newNetPrice = discount.price ?? 1;
          break;
        }
        default: {
          newNetPrice = netPrice;
        }
      }

      const discountAmounts = calculateAmounts({
        netPrice: newNetPrice,
        quantity: discount.quantity,
        vatRate,
      });

      return {
        discountedQuantity: prev.discountedQuantity + discount.quantity,
        discountedNetAmount:
          prev.discountedNetAmount + discountAmounts.netAmount,
        discountedVatAmount:
          prev.discountedVatAmount + discountAmounts.vatAmount,
        discountedGrossAmount:
          prev.discountedGrossAmount + discountAmounts.grossAmount,
      };
    },
    {
      discountedQuantity: 0,
      discountedNetAmount: 0,
      discountedVatAmount: 0,
      discountedGrossAmount: 0,
    }
  );

  if (discountedQuantity === quantity) {
    return {
      netAmount: discountedNetAmount,
      vatAmount: discountedVatAmount,
      grossAmount: discountedGrossAmount,
    };
  }

  const notDiscountedAmounts = calculateAmounts({
    netPrice,
    quantity: quantity - discountedQuantity,
    vatRate,
  });

  return {
    netAmount: discountedNetAmount + notDiscountedAmounts.netAmount,
    vatAmount: discountedVatAmount + notDiscountedAmounts.vatAmount,
    grossAmount: discountedGrossAmount + notDiscountedAmounts.grossAmount,
  };
}
