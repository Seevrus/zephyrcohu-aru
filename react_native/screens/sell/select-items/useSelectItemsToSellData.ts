import { type BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { type EventArg, useFocusEffect } from '@react-navigation/native';
import { format } from 'date-fns';
import { useAtom, useAtomValue } from 'jotai';
import { loadable } from 'jotai/utils';
import {
  all,
  anyPass,
  assoc,
  assocPath,
  dissoc,
  dissocPath,
  equals,
  filter,
  identity,
  indexBy,
  isEmpty,
  isNil,
  map,
  not,
  pipe,
  prop,
  sortBy,
  values,
} from 'ramda';
import { useCallback, useMemo, useState } from 'react';

import { useItems } from '../../../api/queries/useItems';
import { type OrderItem } from '../../../api/request-types/common/OrderItem';
import {
  type Discount,
  type Expiration,
  type ItemType,
} from '../../../api/response-types/ItemsResponseType';
import { currentOrderAtom } from '../../../atoms/orders';
import { currentReceiptAtom } from '../../../atoms/receipts';
import {
  selectedItemsAtom,
  selectedPartnerAtom,
} from '../../../atoms/sellFlow';
import { selectedStoreCurrentStateAtom } from '../../../atoms/storage';
import { type AlertButton } from '../../../components/alert/Alert';
import { useCurrentPriceList } from '../../../hooks/sell/useCurrentPriceList';
import { useResetSellFlow } from '../../../hooks/sell/useResetSellFlow';
import { type StackParams } from '../../../navigators/screen-types';
import { calculateAmounts } from '../../../utils/calculateAmounts';

export type SellExpiration = {
  itemId: number;
  expirationId: number;
  expiresAt: string;
  quantity: number;
};

type SellExpirations = Record<string, SellExpiration>;

export type SellItem = {
  id: number;
  name: string;
  articleNumber: string;
  unitName: string;
  barcodes: string[];
  netPrice: number;
  vatRate: string;
  expirations: SellExpirations;
  availableDiscounts: Discount[] | null;
};

type SellItems = SellItem[];

export function useSelectItemsToSellData(
  navigation: BottomTabNavigationProp<
    StackParams,
    'SelectItemsToSell',
    undefined
  >
) {
  const { data: items, isPending: isItemsPending } = useItems();

  const currentPriceList = useCurrentPriceList();
  const resetSellFlow = useResetSellFlow();

  const [, setCurrentOrder] = useAtom(currentOrderAtom);
  const [, setCurrentReceipt] = useAtom(currentReceiptAtom);
  const selectedStoreCurrentState = useAtomValue(
    loadable(selectedStoreCurrentStateAtom)
  );
  const [selectedItems, setSelectedItems] = useAtom(selectedItemsAtom);
  const selectedPartner = useAtomValue(selectedPartnerAtom);

  const [selectedOrderItems, setSelectedOrderItems] = useState<
    Record<string, number>
  >({});

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [searchState, setSearchState] = useState({
    searchTerm: '',
    barCode: '',
  });

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

  const storageExpirations = useMemo(() => {
    const expirations: Record<string, Record<string, number>> = {};

    if (selectedStoreCurrentState.state !== 'hasData') {
      return expirations;
    }

    selectedStoreCurrentState.data?.expirations?.forEach((expiration) => {
      if (!expirations[expiration.itemId]) {
        expirations[expiration.itemId] = {};
      }
      expirations[expiration.itemId][expiration.expirationId] =
        expiration.quantity;
    });

    return expirations;
  }, [selectedStoreCurrentState]);

  const sellItems: SellItems = useMemo(
    () =>
      pipe(
        map<ItemType, SellItem>((item) => ({
          id: item.id,
          name: item.name,
          articleNumber: item.articleNumber,
          unitName: item.unitName,
          barcodes: item.expirations.map(
            (expiration) => `${item.barcode}${expiration.barcode}`
          ),
          netPrice:
            currentPriceList?.items.find(
              (priceListitem) => priceListitem.itemId === item.id
            )?.netPrice ?? item.netPrice,
          vatRate: item.vatRate,
          expirations: pipe(
            map<Expiration, SellExpiration>((expiration) => ({
              itemId: item.id,
              expirationId: expiration.id,
              expiresAt: expiration.expiresAt,
              quantity: storageExpirations[item.id]?.[expiration.id] ?? 0,
            })),
            filter<SellExpiration>((expiration) => expiration.quantity > 0),
            indexBy(prop('expirationId'))
          )(item.expirations),
          availableDiscounts: item.discounts,
        })),
        filter<SellItem>(
          (item) =>
            item.name
              .toLowerCase()
              .includes(searchState.searchTerm.toLowerCase()) &&
            item.barcodes.some((bc) => bc.includes(searchState.barCode))
        ),
        sortBy(prop('name'))
      )(items ?? []),
    [
      currentPriceList?.items,
      items,
      searchState.barCode,
      searchState.searchTerm,
      storageExpirations,
    ]
  );

  const [netTotal, grossTotal] = useMemo(
    () =>
      Object.entries(selectedItems).reduce(
        (prev, curr) => {
          const [prevNetAmount, prevGrossAmount] = prev;
          const [itemId, expirations] = curr;

          const currentItem = items?.find((item) => item.id === +itemId);

          if (!currentItem) {
            return prev;
          }

          const { vatRate } = currentItem;
          const netPrice =
            currentPriceList?.items.find(
              (priceListitem) => priceListitem.itemId === currentItem.id
            )?.netPrice ?? currentItem.netPrice;

          const [expirationsNetAmount, expirationsGrossAmount] = Object.values(
            expirations
          )
            .map((expirationQuantity) => {
              const { netAmount, grossAmount } = calculateAmounts({
                netPrice,
                quantity: expirationQuantity,
                vatRate,
              });

              return [netAmount, grossAmount];
            })
            .reduce(([pn, pg], [cn, cg]) => [pn + cn, pg + cg], [0, 0]);

          return [
            prevNetAmount + expirationsNetAmount,
            prevGrossAmount + expirationsGrossAmount,
          ];
        },
        [0, 0]
      ),
    [currentPriceList?.items, items, selectedItems]
  );

  const [netOrderTotal, grossOrderTotal] = useMemo(
    () =>
      Object.entries(selectedOrderItems).reduce(
        (prev, curr) => {
          const [prevNetOrderAmount, prevGrossOrderAmount] = prev;
          const [itemId, orderQuantity] = curr;

          const currentItem = items?.find((item) => item.id === +itemId);

          if (!currentItem) {
            return prev;
          }

          const { vatRate } = currentItem;
          const netPrice =
            currentPriceList?.items.find(
              (priceListitem) => priceListitem.itemId === currentItem.id
            )?.netPrice ?? currentItem.netPrice;

          const { netAmount, grossAmount } = calculateAmounts({
            netPrice,
            quantity: orderQuantity,
            vatRate,
          });

          return [
            prevNetOrderAmount + netAmount,
            prevGrossOrderAmount + grossAmount,
          ];
        },
        [0, 0]
      ),
    [currentPriceList?.items, items, selectedOrderItems]
  );

  const upsertSelectedItem = useCallback(
    (id: number, expirationId: number, quantity: number | null) => {
      const newQuantity = quantity ?? undefined;

      setSelectedItems((currentItems) => {
        const itemsWithNewQuantity = isNil(newQuantity)
          ? dissocPath<Record<string, Record<string, number>>>(
              [id.toString(), expirationId.toString()],
              currentItems
            )
          : assocPath(
              [id.toString(), expirationId.toString()],
              newQuantity,
              currentItems
            );

        const areAllQuantitiesZero = pipe(
          values,
          all(anyPass([equals(0), isNil<number>]))
        )(itemsWithNewQuantity[id]);

        if (areAllQuantitiesZero) {
          return dissoc(id.toString(), itemsWithNewQuantity);
        }

        return itemsWithNewQuantity;
      });
    },
    [setSelectedItems]
  );

  const upsertOrderItem = useCallback(
    (id: number, quantity: number | null) => {
      if (quantity) {
        setSelectedOrderItems((prevItems) => ({
          ...prevItems,
          [id]: quantity,
        }));
      } else {
        setSelectedOrderItems(dissoc(String(id)));
      }
    },
    [setSelectedOrderItems]
  );

  const exitConfimationHandler = useCallback(
    (
      event: EventArg<
        'beforeRemove',
        true,
        {
          action: Readonly<{
            type: string;
            payload?: object;
            source?: string;
            target?: string;
          }>;
        }
      >
    ) => {
      event.preventDefault();

      setIsAlertVisible(true);
      setAlertTitle('Megerősítés szükséges');
      setAlertMessage(
        'Biztosan ki szeretne lépni? A folyamat a partnerválasztástól indul újra!'
      );
      setConfirmButton({
        text: 'Igen',
        variant: 'warning',
        onPress: async () => {
          setIsLoading(true);
          await resetSellFlow();
          navigation.dispatch(event.data.action);
        },
      });
    },
    [navigation, resetSellFlow]
  );

  useFocusEffect(
    useCallback(() => {
      navigation.addListener('beforeRemove', exitConfimationHandler);

      return () => {
        navigation.removeListener('beforeRemove', exitConfimationHandler);
      };
    }, [exitConfimationHandler, navigation])
  );

  const canConfirmItems =
    !!items && !!selectedPartner && not(isEmpty(selectedItems));

  const confirmItemsHandler = useCallback(async () => {
    if (canConfirmItems) {
      setIsLoading(true);

      if (not(isEmpty(selectedOrderItems))) {
        await setCurrentOrder({
          isSent: false,
          partnerId: selectedPartner.id,
          orderedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
          items: items
            .map((item) => {
              const quantity = selectedOrderItems[item.id];

              if (quantity === undefined) return;

              return {
                articleNumber: item.articleNumber,
                name: item.name,
                quantity,
              };
            })
            .filter(identity) as OrderItem[],
        });
      }

      await setCurrentReceipt(async (receipt) =>
        assoc(
          'items',
          items
            .flatMap((item) =>
              item.expirations.map((expiration) => {
                const quantity = selectedItems[item.id]?.[expiration.id];

                if (quantity === undefined) return;

                const { netAmount, vatAmount, grossAmount } = calculateAmounts({
                  netPrice: item.netPrice,
                  quantity,
                  vatRate: item.vatRate,
                });

                return {
                  id: item.id,
                  expirationId: expiration.id,
                  CNCode: item.CNCode,
                  articleNumber: item.articleNumber,
                  expiresAt: format(new Date(expiration.expiresAt), 'yyyy-MM'),
                  name: item.name,
                  quantity,
                  unitName: item.unitName,
                  netPrice: item.netPrice,
                  netAmount,
                  vatRate: item.vatRate,
                  vatAmount,
                  grossAmount,
                };
              })
            )
            .filter(identity),
          await receipt
        )
      );

      setIsLoading(false);

      navigation.removeListener('beforeRemove', exitConfimationHandler);
      navigation.navigate('Review');
    }
  }, [
    canConfirmItems,
    exitConfimationHandler,
    items,
    navigation,
    selectedItems,
    selectedOrderItems,
    selectedPartner?.id,
    setCurrentOrder,
    setCurrentReceipt,
  ]);

  return {
    isLoading:
      isLoading ||
      isItemsPending ||
      selectedStoreCurrentState.state !== 'hasData',
    selectedOrderItems,
    searchState,
    setSearchState,
    items: sellItems,
    upsertSelectedItem,
    upsertOrderItem,
    netTotal,
    grossTotal,
    netOrderTotal,
    grossOrderTotal,
    canConfirmItems,
    confirmItemsHandler,
    alert: {
      isAlertVisible,
      alertTitle,
      alertMessage,
      alertConfirmButton: confirmButton,
      resetAlertHandler,
    },
  };
}
