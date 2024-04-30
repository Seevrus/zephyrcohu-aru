import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAtom } from 'jotai';
import { any, assoc, dissoc, isEmpty, isNil, not, trim } from 'ramda';
import { useCallback, useState } from 'react';

import {
  currentReceiptAtom,
  type SelectedDiscount,
} from '../../../atoms/receipts';
import {
  type RegularReviewItem,
  reviewItemsAtom,
} from '../../../atoms/sellFlow';
import { type StackParams } from '../../../navigators/screen-types';

type FormErrors = {
  absoluteDiscountedQuantity?: boolean;
  percentageDiscountedQuantity?: boolean;
  freeFormPrice?: boolean;
  freeFormDiscountedQuantity?: boolean;
};

type UseDiscountsProps = {
  navigation: NativeStackNavigationProp<StackParams, 'Discounts', undefined>;
  item: RegularReviewItem;
};

export function useDiscountsData({ navigation, item }: UseDiscountsProps) {
  const [, setCurrentReceipt] = useAtom(currentReceiptAtom);
  const [, setReviewItems] = useAtom(reviewItemsAtom);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const applyDiscounts = useCallback(
    (itemId: number, discounts?: SelectedDiscount[]) => {
      setReviewItems((prevItems) => {
        if (isNil(prevItems)) {
          return prevItems;
        }

        return prevItems.map((item) => {
          if (item.itemId !== itemId || item.type !== 'item') {
            return item;
          }

          if (discounts) {
            return assoc('selectedDiscounts', discounts, item);
          }

          return dissoc('selectedDiscounts', item);
        });
      });
    },
    [setReviewItems]
  );

  const saveDiscountedItemsInFlow = useCallback(
    async (itemId: number, discounts?: SelectedDiscount[]) => {
      applyDiscounts(itemId, discounts);

      await setCurrentReceipt(async (prevReceiptPromise) => {
        const prevReceipt = await prevReceiptPromise;

        return {
          ...prevReceipt,
          items: prevReceipt?.items?.map((contextReceiptItem) => {
            if (contextReceiptItem.id !== itemId) {
              return contextReceiptItem;
            }

            if (discounts) {
              return assoc('selectedDiscounts', discounts, contextReceiptItem);
            }

            return dissoc('selectedDiscounts', contextReceiptItem);
          }),
        };
      });
    },
    [applyDiscounts, setCurrentReceipt]
  );

  const absoluteDiscount = item.availableDiscounts?.find(
    (d) => d.type === 'absolute'
  );
  const percentageDiscount = item.availableDiscounts?.find(
    (d) => d.type === 'percentage'
  );
  const freeFormDiscount = item.availableDiscounts?.find(
    (d) => d.type === 'freeForm'
  );

  const currentAbsoluteDiscount = item.selectedDiscounts?.find(
    (d) => d.type === 'absolute'
  );
  const currentPercentageDiscount = item.selectedDiscounts?.find(
    (d) => d.type === 'percentage'
  );
  const currentFreeFormDiscount = item.selectedDiscounts?.find(
    (d) => d.type === 'freeForm'
  );

  const [absoluteDiscountedQuantity, setAbsoluteDiscountedQuantity] =
    useState<string>(String(currentAbsoluteDiscount?.quantity ?? ''));
  const [percentageDiscountedQuantity, setPercentageDiscountedQuantity] =
    useState<string>(String(currentPercentageDiscount?.quantity ?? ''));
  const [freeFormPrice, setFreeFormPrice] = useState<string>(
    String(currentFreeFormDiscount?.price ?? -item.netPrice)
  );
  const [freeFormDiscountedQuantity, setFreeFormDiscountedQuantity] =
    useState<string>(String(currentFreeFormDiscount?.quantity ?? ''));

  const [formError, setFormError] = useState<FormErrors>({});
  const [formErrorMessage, setFormErrorMessage] = useState<string>('');

  const handleApplyDiscounts = async () => {
    setFormError({});
    setFormErrorMessage('');

    let errorMessage = '';
    const formErrors: FormErrors = {};

    const absolute = Number(absoluteDiscountedQuantity) ?? 0;
    const percentage = Number(percentageDiscountedQuantity) ?? 0;
    const freeForm = Number(freeFormDiscountedQuantity) ?? 0;
    const price = Number(freeFormPrice) ?? 0;

    if (any(Number.isNaN, [absolute, percentage, freeForm, price])) {
      errorMessage += ' Csak számok adhatóak meg.';
    }

    if (absolute + percentage + freeForm > item.quantity) {
      errorMessage += ' Túl nagy megadott mennyiség.';
      formErrors.absoluteDiscountedQuantity = true;
      formErrors.percentageDiscountedQuantity = true;
      formErrors.freeFormDiscountedQuantity = true;
    }
    if (freeForm > 0 && price > 0) {
      errorMessage += ' A kedvezményt negatív számként lehetséges megadni.';
      formErrors.freeFormPrice = true;
    }

    if (errorMessage) {
      setFormErrorMessage(trim(errorMessage));
    }
    if (not(isEmpty(formErrors))) {
      setFormError(formErrors);
    }

    if (!errorMessage && isEmpty(formErrors)) {
      setIsLoading(true);

      await (absolute + percentage + freeForm === 0
        ? saveDiscountedItemsInFlow(item.itemId)
        : saveDiscountedItemsInFlow(item.itemId, [
            ...(absolute > 0 && absoluteDiscount
              ? [
                  {
                    id: absoluteDiscount.id,
                    name: absoluteDiscount.name,
                    quantity: absolute,
                    amount: absoluteDiscount.amount,
                    type: 'absolute',
                  } as const,
                ]
              : []),
            ...(percentage > 0 && percentageDiscount
              ? [
                  {
                    id: percentageDiscount.id,
                    name: percentageDiscount.name,
                    quantity: percentage,
                    amount: percentageDiscount.amount,
                    type: 'percentage',
                  } as const,
                ]
              : []),
            ...(freeForm > 0 && freeFormDiscount
              ? [
                  {
                    id: freeFormDiscount.id,
                    name: freeFormDiscount.name,
                    quantity: freeForm,
                    price,
                    type: 'freeForm',
                  } as const,
                ]
              : []),
          ]));

      setIsLoading(false);
      navigation.goBack();
    }
  };

  return {
    isLoading,
    formError,
    formErrorMessage,
    absoluteDiscount,
    absoluteDiscountedQuantity,
    setAbsoluteDiscountedQuantity,
    percentageDiscount,
    percentageDiscountedQuantity,
    setPercentageDiscountedQuantity,
    freeFormDiscount,
    freeFormDiscountedQuantity,
    setFreeFormDiscountedQuantity,
    freeFormPrice,
    setFreeFormPrice,
    handleApplyDiscounts,
  };
}
