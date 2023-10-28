import { assoc, complement, dissoc, filter, map, mergeLeft, pipe, prepend, prop } from 'ramda';

import { ContextReceipt } from '../../providers/types/receipts-provider-types';
import calculateAmounts from '../../utils/calculateAmounts';
import { ReceiptRequest, ReceiptRequestData } from '../request-types/CreateReceiptsRequestType';
import { ReceiptItem } from '../request-types/common/ReceiptItemsTypes';

export default function mapCreateReceiptsRequest(receipts: ContextReceipt[]): ReceiptRequestData {
  return pipe(
    filter<ContextReceipt>(complement(prop('isSent'))),
    map<ContextReceipt, ReceiptRequest>((receipt) => {
      const requestItems = receipt.items.flatMap<ReceiptItem>((contextItem) => {
        const contextItemWithoutDiscounts = dissoc('selectedDiscounts', contextItem);

        if (!contextItem.selectedDiscounts) {
          return contextItemWithoutDiscounts;
        }

        const discountedItems: ReceiptItem[] = contextItem.selectedDiscounts.map(
          (selectedDiscount) => {
            let newNetPrice: number;
            switch (selectedDiscount.type) {
              case 'absolute':
                newNetPrice = contextItem.netPrice - selectedDiscount.amount;
                break;
              case 'percentage':
                newNetPrice = contextItem.netPrice * (100 - selectedDiscount.amount);
                break;
              case 'freeForm':
                newNetPrice = selectedDiscount.price ?? 1;
                break;
              default:
                newNetPrice = selectedDiscount;
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

      return assoc('items', requestItems, receipt);
    })
  )(receipts);
}
