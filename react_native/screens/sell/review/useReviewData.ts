import { useNetInfo } from '@react-native-community/netinfo';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { add, format, parseISO } from 'date-fns';
import { useAtom, useAtomValue } from 'jotai';
import { and, dissoc, dissocPath, isEmpty, reduce } from 'ramda';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useSellSelectedItems } from '../../../api/mutations/useSellSelectedItems';
import { useActiveRound } from '../../../api/queries/useActiveRound';
import { useCheckToken } from '../../../api/queries/useCheckToken';
import { useItems } from '../../../api/queries/useItems';
import { useOtherItems } from '../../../api/queries/useOtherItems';
import { type StoreDetailsResponseData } from '../../../api/response-types/StoreDetailsResponseType';
import { currentOrderAtom, ordersAtom } from '../../../atoms/orders';
import {
  type ContextReceipt,
  currentReceiptAtom,
  receiptsAtom,
} from '../../../atoms/receipts';
import {
  type OtherReviewItem,
  type RegularReviewItem,
  reviewItemsAtom,
  selectedItemsAtom,
  selectedOtherItemsAtom,
} from '../../../atoms/sellFlow';
import { selectedStoreCurrentStateAtom } from '../../../atoms/storage';
import { tokenAtom } from '../../../atoms/token';
import { type AlertButton } from '../../../components/alert/Alert';
import { useCurrentPriceList } from '../../../hooks/sell/useCurrentPriceList';
import { useResetSellFlow } from '../../../hooks/sell/useResetSellFlow';
import { type StackParams } from '../../../navigators/screen-types';
import { calculateAmounts } from '../../../utils/calculateAmounts';
import { calculateDiscountedItemAmounts } from '../../../utils/calculateDiscountedItemAmounts';
import { calculateReceiptTotals } from '../../../utils/calculateReceiptTotals';

export function useReviewData(
  navigation: NativeStackNavigationProp<StackParams, 'Review', undefined>
) {
  const { isInternetReachable } = useNetInfo();
  const { token } = useAtomValue(tokenAtom);

  const { data: activeRound } = useActiveRound();
  const { data: user } = useCheckToken();
  const { data: items, isPending: isItemsPending } = useItems();
  const { data: otherItems, isPending: isOtherItemsPending } = useOtherItems();

  const { mutateAsync: updateStorageAPI } = useSellSelectedItems();

  const currentPriceList = useCurrentPriceList();
  const resetSellFlow = useResetSellFlow();

  const currentOrder = useAtomValue(currentOrderAtom);
  const [currentReceipt, setCurrentReceipt] = useAtom(currentReceiptAtom);
  const [selectedStoreCurrentState, setSelectedStoreCurrentState] = useAtom(
    selectedStoreCurrentStateAtom
  );
  const [, setOrders] = useAtom(ordersAtom);
  const [receipts, setReceipts] = useAtom(receiptsAtom);
  const [reviewItems, setReviewItems] = useAtom(reviewItemsAtom);
  const [selectedItems, setSelectedItems] = useAtom(selectedItemsAtom);
  const [selectedOtherItems, setSelectedOtherItems] = useAtom(
    selectedOtherItemsAtom
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [saveReceiptError, setSaveReceiptError] = useState<string>('');

  const [isAlertVisible, setIsAlertVisible] = useState<boolean>(false);
  const [alertTitle, setAlertTitle] = useState<string>('');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [confirmButton, setConfirmButton] = useState<AlertButton | null>(null);

  const resetAlertHandler = useCallback(() => {
    setIsAlertVisible(false);
    setAlertTitle('');
    setAlertMessage(null);
    setConfirmButton(null);
  }, []);

  const discountedGrossAmount = useMemo(
    () =>
      reduce(
        (accumulatedGrossAmount, reviewItem) => {
          const { grossAmount } = calculateDiscountedItemAmounts(reviewItem);
          return accumulatedGrossAmount + grossAmount;
        },
        0,
        reviewItems ?? []
      ),
    [reviewItems]
  );

  const removeItemHandler = useCallback(
    ({ itemId, expirationId }: { itemId: number; expirationId: number }) => {
      setSelectedItems((prevItems) => {
        if (Object.keys(prevItems[itemId]).length === 1) {
          return dissoc(itemId, prevItems);
        }

        return dissocPath([itemId, expirationId], prevItems);
      });
    },
    [setSelectedItems]
  );

  const removeOtherItemHandler = useCallback(
    (otherItemId: number) => {
      setSelectedOtherItems(dissoc(otherItemId));
    },
    [setSelectedOtherItems]
  );

  useEffect(() => {
    const numberOfRegularReviewItems = reviewItems?.reduce(
      (numberOfItems, item) =>
        item.type === 'item' ? numberOfItems + 1 : numberOfItems,
      0
    );

    if (reviewItems && numberOfRegularReviewItems === 0) {
      setIsLoading(true);
      resetSellFlow();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Index' }],
      });
    }
  }, [navigation, resetSellFlow, reviewItems]);

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

          return Object.entries(expirations).map<RegularReviewItem | undefined>(
            ([expirationId, quantity]) => {
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
              };
            }
          );
        })
        .filter((item): item is RegularReviewItem => !!item)
        .sort((item1, item2) => item1.name.localeCompare(item2.name, 'HU-hu'));

      const otherReviewItems: OtherReviewItem[] = Object.entries(
        selectedOtherItems
      )
        .map<OtherReviewItem | undefined>(
          ([otherItemId, { netPrice, quantity, comment }]) => {
            const otherItem = otherItems.find(
              (index) => index.id === +otherItemId
            );

            if (!otherItem || !quantity) {
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
              comment: comment ?? undefined,
            };
          }
        )
        .filter((item): item is OtherReviewItem => !!item);

      return [...regularReviewItems, ...otherReviewItems];
    });
  }, [
    currentPriceList?.items,
    items,
    otherItems,
    selectedItems,
    selectedOtherItems,
    setReviewItems,
  ]);

  const finishReview = useCallback(async () => {
    if (currentOrder) {
      setOrders(async (prevOrders) => [...(await prevOrders), currentOrder]);
    }

    if (!!activeRound && !!currentReceipt && !!token && !!user) {
      const serialNumber = isEmpty(receipts)
        ? selectedStoreCurrentState?.firstAvailableSerialNumber
        : receipts.reduce(
            (sn, { serialNumber: receiptSn }) =>
              receiptSn > sn ? receiptSn : sn,
            0
          ) + 1;

      const receiptTotals = calculateReceiptTotals({
        items: currentReceipt.items ?? [],
        otherItems: currentReceipt.otherItems,
      });

      const invoiceDate = parseISO(activeRound.roundStarted);
      const fulfillmentDate = add(invoiceDate, {
        days: currentReceipt.paymentDays ?? 0,
      });
      const receiptDateFormat = 'yyyy-MM-dd';

      const roundedAmount =
        currentReceipt.invoiceType === 'P'
          ? Math.round(receiptTotals.grossAmount / 5) * 5
          : receiptTotals.grossAmount;
      const roundAmount = roundedAmount - receiptTotals.grossAmount;

      const finalReceipt = {
        ...currentReceipt,
        isSent: false,
        shouldBeUpdated: false,
        serialNumber,
        yearCode: selectedStoreCurrentState?.yearCode,
        originalCopiesPrinted: 0,
        vendor: {
          name: user.company.name,
          country: user.company.country,
          postalCode: user.company.postalCode,
          city: user.company.city,
          address: user.company.address,
          felir: user.company.felir,
          iban: user.company.iban,
          bankAccount: user.company.bankAccount,
          vatNumber: user.company.vatNumber,
        },
        invoiceDate: format(invoiceDate, receiptDateFormat),
        fulfillmentDate: format(fulfillmentDate, receiptDateFormat),
        paidDate: format(fulfillmentDate, receiptDateFormat),
        ...receiptTotals,
        roundAmount,
        roundedAmount,
      } as ContextReceipt;

      await setCurrentReceipt(finalReceipt);

      await setReceipts(async (prevReceiptsPromise) => {
        const prevReceipts = await prevReceiptsPromise;
        return [...prevReceipts, finalReceipt];
      });
    }

    if (selectedStoreCurrentState) {
      const updatedStorage: StoreDetailsResponseData = {
        ...selectedStoreCurrentState,
        expirations: selectedStoreCurrentState.expirations.map((expiration) => {
          const soldItemQuantity =
            selectedItems?.[expiration.itemId]?.[expiration.expirationId];

          if (!soldItemQuantity) {
            return expiration;
          }

          return {
            ...expiration,
            quantity: expiration.quantity - soldItemQuantity,
          };
        }),
      };

      if (isInternetReachable === true) {
        await updateStorageAPI(updatedStorage);
      }

      await setSelectedStoreCurrentState(updatedStorage);
    }
  }, [
    activeRound,
    currentOrder,
    currentReceipt,
    isInternetReachable,
    receipts,
    selectedItems,
    selectedStoreCurrentState,
    setCurrentReceipt,
    setOrders,
    setReceipts,
    setSelectedStoreCurrentState,
    token,
    updateStorageAPI,
    user,
  ]);

  const removeReceiptHandler = useCallback(() => {
    setIsAlertVisible(true);
    setAlertTitle('Folyamat törlése');
    setAlertMessage(
      'Ez a lépés törli a jelenlegi árulevételi munkamenetet és visszairányít a kezdőoldalra. Biztosan folytatni szeretné?'
    );
    setConfirmButton({
      text: 'Biztosan ezt szeretném',
      variant: 'warning',
      onPress: async () => {
        setIsLoading(true);
        await resetSellFlow();
        navigation.reset({
          index: 0,
          routes: [{ name: 'Index' }],
        });
      },
    });
  }, [navigation, resetSellFlow]);

  const confirmReceiptHandler = useCallback(() => {
    setIsAlertVisible(true);
    setAlertTitle('Árulevétel véglegesítése');
    setAlertMessage(
      'Ez a lépés számlakészítéssel jár, ezután már nem lesz lehetőség semmilyen módosításra. Biztosan folytatni szeretné?'
    );
    setConfirmButton({
      text: 'Biztosan ezt szeretném',
      variant: 'warning',
      onPress: async () => {
        try {
          setSaveReceiptError('');
          setIsLoading(true);
          await finishReview();
          navigation.reset({
            index: 1,
            routes: [{ name: 'Index' }, { name: 'Summary' }],
          });
        } catch (error) {
          setSaveReceiptError(error.message);
          setIsLoading(false);
        }
      },
    });
  }, [finishReview, navigation]);

  return {
    isLoading: isLoading || isItemsPending || isOtherItemsPending,
    discountedGrossAmount,
    removeItemHandler,
    removeOtherItemHandler,
    saveReceiptError,
    removeReceiptHandler,
    canConfirm: !!activeRound && !!currentReceipt && !!token && !!user,
    confirmReceiptHandler,
    alert: {
      isAlertVisible,
      alertTitle,
      alertMessage,
      alertConfirmButton: confirmButton,
      resetAlertHandler,
    },
  };
}
