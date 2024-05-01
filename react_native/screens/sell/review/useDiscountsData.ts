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
  regularReviewItem: RegularReviewItem;
};

export function useDiscountsData({
  navigation,
  regularReviewItem,
}: UseDiscountsProps) {
  const [, setCurrentReceipt] = useAtom(currentReceiptAtom);
  const [, setReviewItems] = useAtom(reviewItemsAtom);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const applyDiscounts = useCallback(
    (discounts?: SelectedDiscount[]) => {
      setReviewItems((prevItems) => {
        if (isNil(prevItems)) {
          return prevItems;
        }

        return prevItems.map((prevItem) => {
          if (
            prevItem.type !== 'item' ||
            prevItem.itemId !== regularReviewItem.itemId ||
            prevItem.expirationId !== regularReviewItem.expirationId
          ) {
            return prevItem;
          }

          if (discounts) {
            return assoc('selectedDiscounts', discounts, prevItem);
          }

          return dissoc('selectedDiscounts', prevItem);
        });
      });
    },
    [regularReviewItem.expirationId, regularReviewItem.itemId, setReviewItems]
  );

  const saveDiscountedItemsInFlow = useCallback(
    async (discounts?: SelectedDiscount[]) => {
      applyDiscounts(discounts);

      await setCurrentReceipt(async (prevReceiptPromise) => {
        const prevReceipt = await prevReceiptPromise;

        return {
          ...prevReceipt,
          items: prevReceipt?.items?.map((contextReceiptItem) => {
            if (
              contextReceiptItem.id !== regularReviewItem.itemId ||
              contextReceiptItem.expirationId !== regularReviewItem.expirationId
            ) {
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
    [
      applyDiscounts,
      regularReviewItem.expirationId,
      regularReviewItem.itemId,
      setCurrentReceipt,
    ]
  );

  const absoluteDiscount = regularReviewItem.availableDiscounts?.find(
    (discount) => discount.type === 'absolute'
  );
  const percentageDiscount = regularReviewItem.availableDiscounts?.find(
    (discount) => discount.type === 'percentage'
  );
  const freeFormDiscount = regularReviewItem.availableDiscounts?.find(
    (discount) => discount.type === 'freeForm'
  );

  const currentAbsoluteDiscount = regularReviewItem.selectedDiscounts?.find(
    (discount) => discount.type === 'absolute'
  );
  const currentPercentageDiscount = regularReviewItem.selectedDiscounts?.find(
    (discount) => discount.type === 'percentage'
  );
  const currentFreeFormDiscount = regularReviewItem.selectedDiscounts?.find(
    (discount) => discount.type === 'freeForm'
  );

  const [absoluteDiscountedQuantity, setAbsoluteDiscountedQuantity] =
    useState<string>(String(currentAbsoluteDiscount?.quantity ?? ''));
  const [percentageDiscountedQuantity, setPercentageDiscountedQuantity] =
    useState<string>(String(currentPercentageDiscount?.quantity ?? ''));
  const [freeFormPrice, setFreeFormPrice] = useState<string>(
    String(currentFreeFormDiscount?.price ?? -regularReviewItem.netPrice)
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

    if (absolute + percentage + freeForm > regularReviewItem.quantity) {
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
        ? saveDiscountedItemsInFlow()
        : saveDiscountedItemsInFlow([
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
