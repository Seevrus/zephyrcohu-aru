import { useNetInfo } from '@react-native-community/netinfo';
import { useAtom, useAtomValue } from 'jotai';
import { and, dissoc, dissocPath, isEmpty, reduce } from 'ramda';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  View,
  type ListRenderItem,
  type ListRenderItemInfo,
} from 'react-native';

import { useSellSelectedItems } from '../../../api/mutations/useSellSelectedItems';
import { useCheckToken } from '../../../api/queries/useCheckToken';
import { useItems } from '../../../api/queries/useItems';
import { useOtherItems } from '../../../api/queries/useOtherItems';
import { type StoreDetailsResponseData } from '../../../api/response-types/StoreDetailsResponseType';
import { currentOrderAtom, ordersAtom } from '../../../atoms/orders';
import {
  currentReceiptAtom,
  receiptsAtom,
  type ContextReceipt,
} from '../../../atoms/receipts';
import {
  reviewItemsAtom,
  selectedItemsAtom,
  selectedOtherItemsAtom,
  type OtherReviewItem,
  type RegularReviewItem,
  type ReviewItem,
} from '../../../atoms/sellFlow';
import { selectedStoreAtom } from '../../../atoms/storage';
import { Loading } from '../../../components/Loading';
import { ErrorCard } from '../../../components/info-cards/ErrorCard';
import { Button } from '../../../components/ui/Button';
import { LabeledItem } from '../../../components/ui/LabeledItem';
import { colors } from '../../../constants/colors';
import { useCurrentPriceList } from '../../../hooks/sell/useCurrentPriceList';
import { useResetSellFlow } from '../../../hooks/sell/useResetSellFlow';
import { type ReviewProps } from '../../../navigators/screen-types';
import { calculateAmounts } from '../../../utils/calculateAmounts';
import { calculateDiscountedItemAmounts } from '../../../utils/calculateDiscountedItemAmounts';
import { calculateReceiptTotals } from '../../../utils/calculateReceiptTotals';
import { formatPrice } from '../../../utils/formatPrice';
import { OtherItemSelection } from './OtherItemSelection';
import { RegularItemSelection } from './RegularItemSelection';
import { getReviewItemId } from './getReviewItemId';

function SuspendedReview({ navigation }: ReviewProps) {
  const { isInternetReachable } = useNetInfo();

  const { data: user, isPending: isUserPending } = useCheckToken();
  const { data: items, isPending: isItemsPending } = useItems();
  const { data: otherItems, isPending: isOtherItemsPending } = useOtherItems();

  const { mutateAsync: updateStorageAPI } = useSellSelectedItems();

  const currentPriceList = useCurrentPriceList();
  const resetSellFlow = useResetSellFlow();

  const currentOrder = useAtomValue(currentOrderAtom);
  const [currentReceipt, setCurrentReceipt] = useAtom(currentReceiptAtom);
  const [selectedStoreCurrentState, setSelectedStoreCurrentState] =
    useAtom(selectedStoreAtom);
  const [, setOrders] = useAtom(ordersAtom);
  const [receipts, setReceipts] = useAtom(receiptsAtom);
  const [reviewItems, setReviewItems] = useAtom(reviewItemsAtom);
  const [selectedItems, setSelectedItems] = useAtom(selectedItemsAtom);
  const [selectedOtherItems, setSelectedOtherItems] = useAtom(
    selectedOtherItemsAtom
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedRow, setSelectedRow] = useState<ReviewItem | null>(null);
  const [saveReceiptError, setSaveReceiptError] = useState<string>('');

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

  const removeReceiptHandler = useCallback(() => {
    Alert.alert(
      'Folyamat törlése',
      'Ez a lépés törli a jelenlegi árulevételi munkamenetet és visszairányít a kezdőoldalra. Biztosan folytatni szeretné?',
      [
        { text: 'Mégse' },
        {
          text: 'Biztosan ezt szeretném',
          onPress: async () => {
            setIsLoading(true);
            resetSellFlow();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Index' }],
            });
          },
        },
      ]
    );
  }, [navigation, resetSellFlow]);

  const finishReview = useCallback(async () => {
    if (currentOrder) {
      setOrders(async (prevOrders) => [...(await prevOrders), currentOrder]);
    }
    if (!!currentReceipt && !!user) {
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
        ...receiptTotals,
        roundAmount,
        roundedAmount,
      } as ContextReceipt;

      setCurrentReceipt(finalReceipt);

      setReceipts(async (prevReceiptsPromise) => {
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

      setSelectedStoreCurrentState(updatedStorage);
    }
  }, [
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
    updateStorageAPI,
    user,
  ]);

  const confirmReceiptHandler = useCallback(() => {
    Alert.alert(
      'Árulevétel véglegesítése',
      'Ez a lépés számlakészítéssel jár, ezután már nem lesz lehetőség semmilyen módosításra. Biztosan folytatni szeretné?',
      [
        { text: 'Mégse' },
        {
          text: 'Biztosan ezt szeretném',
          onPress: async () => {
            try {
              setIsLoading(true);
              await finishReview();
              navigation.reset({
                index: 1,
                routes: [{ name: 'Index' }, { name: 'Summary' }],
              });
            } catch (error) {
              setSaveReceiptError(error.message);
            }
          },
        },
      ]
    );
  }, [finishReview, navigation]);

  const renderReceiptRow: ListRenderItem<ReviewItem> = useCallback(
    (info: ListRenderItemInfo<ReviewItem>) => {
      const reviewItemId = getReviewItemId(info.item);
      const selectedRowId = getReviewItemId(selectedRow);

      return info.item.type === 'item' ? (
        <RegularItemSelection
          selected={reviewItemId === selectedRowId}
          item={info.item}
          onSelect={(id: string | number) => {
            setSelectedRow(
              reviewItems.find((row) => getReviewItemId(row) === id) ?? null
            );
          }}
          onDelete={removeItemHandler}
        />
      ) : (
        <OtherItemSelection
          selected={reviewItemId === selectedRowId}
          item={info.item}
          onSelect={(id: string) => {
            setSelectedRow(
              reviewItems.find((row) => getReviewItemId(row) === id) ?? null
            );
          }}
          onDelete={removeOtherItemHandler}
        />
      );
    },
    [removeItemHandler, removeOtherItemHandler, reviewItems, selectedRow]
  );

  if (isLoading || isItemsPending || isOtherItemsPending || isUserPending) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      {!!saveReceiptError && (
        <View style={styles.error}>
          <ErrorCard>{saveReceiptError}</ErrorCard>
        </View>
      )}
      <View style={styles.headerContainer}>
        <View style={styles.headerButtonContainer}>
          <Button
            variant="ok"
            onPress={() => {
              navigation.navigate('SelectOtherItemsToSell');
            }}
          >
            Extra tételek
          </Button>
        </View>
      </View>
      <View style={styles.receiptContainer}>
        <FlatList
          data={reviewItems}
          renderItem={renderReceiptRow}
          keyExtractor={getReviewItemId}
        />
      </View>
      <View style={styles.footerContainer}>
        <View style={styles.grossAmountContainer}>
          <LabeledItem
            label="Mindösszesen"
            text={formatPrice(discountedGrossAmount)}
          />
        </View>
        <View style={styles.buttonsContainer}>
          <Button variant="warning" onPress={removeReceiptHandler}>
            Elvetés
          </Button>
          <Button variant="ok" onPress={confirmReceiptHandler}>
            Véglegesítés
          </Button>
        </View>
      </View>
    </View>
  );
}

export function Review(props: ReviewProps) {
  return (
    <Suspense>
      <SuspendedReview {...props} />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  buttonsContainer: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: '7%',
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  error: {
    marginTop: 30,
  },
  footerContainer: {
    backgroundColor: colors.neutral,
    borderTopColor: colors.white,
    borderTopWidth: 2,
    height: 110,
    marginTop: 5,
  },
  grossAmountContainer: {
    alignItems: 'flex-end',
    marginHorizontal: '7%',
    marginVertical: 10,
  },
  headerButtonContainer: {
    width: '40%',
  },
  headerContainer: {
    alignItems: 'flex-end',
    height: 70,
    marginHorizontal: '7%',
    marginTop: 10,
  },
  receiptContainer: {
    flex: 1,
  },
});
