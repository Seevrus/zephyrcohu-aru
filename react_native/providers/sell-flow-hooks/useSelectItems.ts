import { format, formatISO } from 'date-fns';
import {
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
} from 'ramda';
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';

import { useItems } from '../../api/queries/useItems';
import { type Partners } from '../../api/response-mappers/mapPartnersResponse';
import {
  type Discount,
  type Expiration,
  type ItemType,
} from '../../api/response-types/ItemsResponseType';
import { type PriceListType } from '../../api/response-types/PriceListResponseType';
import {
  itemsSearchReducer,
  SearchStateActionKind,
} from '../../hooks/itemsSearchReducer';
import { calculateAmounts } from '../../utils/calculateAmounts';
import { useOrdersContext } from '../OrdersProvider';
import { useReceiptsContext } from '../ReceiptsProvider';
import { useStorageContext } from '../StorageProvider';

export type SellExpiration = {
  itemId: number;
  expirationId: number;
  expiresAt: string;
  quantity: number | undefined;
};

type SellExpirations = Record<number, SellExpiration>;

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

export type UseSelectItems = {
  isPending: boolean;
  items: SellItems;
  selectedItems: Record<number, Record<number, number>>;
  setSelectedItems: Dispatch<
    SetStateAction<Record<number, Record<number, number>>>
  >;
  selectedOrderItems: Record<number, number>;
  setSelectedOrderItems: Dispatch<SetStateAction<Record<number, number>>>;
  searchTerm: string;
  setSearchTerm: (payload: string) => void;
  barCode: string;
  setBarCode: (payload: string) => void;
  saveSelectedItemsInFlow: () => Promise<void>;
  saveSelectedOrderItemsInFlow: () => Promise<void>;
  resetUseSelectItems: () => void;
};

export function useSelectItems({
  selectedPartner,
  currentPriceList,
}: {
  selectedPartner: Partners[number];
  currentPriceList: PriceListType;
}): UseSelectItems {
  const { data: items } = useItems();
  const {
    isPending: isReceiptsContextPending,
    currentReceipt,
    setCurrentReceiptItems,
  } = useReceiptsContext();
  const { isPending: isOrdersContextPending, saveCurrentOrder } =
    useOrdersContext();
  const { storage, isPending: isStoragePending } = useStorageContext();

  const [storageExpirations, setStorageExpirations] = useState<
    Record<number, Record<number, number>>
  >({});

  const [selectedItems, setSelectedItems] = useState<
    Record<number, Record<number, number>>
  >({});
  const [selectedOrderItems, setSelectedOrderItems] = useState<
    Record<number, number>
  >({});

  const [searchState, dispatchSearchState] = useReducer(itemsSearchReducer, {
    searchTerm: '',
    barCode: '',
  });

  const { searchTerm, barCode } = searchState;

  const setSearchTerm = useCallback(
    (payload: string) =>
      dispatchSearchState({
        type: SearchStateActionKind.SetSearchTerm,
        payload,
      }),
    []
  );
  const setBarCode = useCallback(
    (payload: string) =>
      dispatchSearchState({ type: SearchStateActionKind.SetBarCode, payload }),
    []
  );

  const sellItems = useMemo(
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
            currentPriceList?.items.find((index) => index.itemId === item.id)
              ?.netPrice ?? item.netPrice,
          vatRate: item.vatRate,
          expirations: pipe(
            map<Expiration, SellExpiration>((expiration) => ({
              itemId: item.id,
              expirationId: expiration.id,
              expiresAt: expiration.expiresAt,
              quantity: storageExpirations[item.id]?.[expiration.id] ?? 0,
            })),
            indexBy(prop('itemId'))
          )(item.expirations),
          availableDiscounts: item.discounts,
        })),
        filter<SellItem>(
          (item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            item.barcodes.some((bc) => bc.includes(barCode))
        ),
        sortBy(prop('name'))
      )(items ?? []) satisfies SellItems,
    [barCode, currentPriceList?.items, items, searchTerm, storageExpirations]
  );

  const saveSelectedItemsInFlow = useCallback(async () => {
    await setCurrentReceiptItems(
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
        .filter(identity)
    );
  }, [items, selectedItems, setCurrentReceiptItems]);

  const saveSelectedOrderItemsInFlow = useCallback(async () => {
    await saveCurrentOrder({
      isSent: false,
      partnerId: selectedPartner.id,
      orderedAt: formatISO(new Date()),
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
        .filter(identity),
    });
  }, [items, saveCurrentOrder, selectedOrderItems, selectedPartner?.id]);

  const resetUseSelectItems = useCallback(() => {
    setStorageExpirations({});
    setSelectedItems({});
    setSelectedOrderItems({});
    dispatchSearchState({
      type: SearchStateActionKind.ClearSearch,
      payload: '',
    });
  }, []);

  useEffect(() => {
    setStorageExpirations((prevExpirations) => {
      if (!isEmpty(prevExpirations) || isNil(storage)) return prevExpirations;

      const expirations: Record<number, Record<number, number>> = {};

      storage.expirations.forEach((expiration) => {
        if (!expirations[expiration.itemId]) {
          expirations[expiration.itemId] = {};
        }
        expirations[expiration.itemId][expiration.expirationId] =
          expiration.quantity;
      });

      return expirations;
    });
  }, [storage]);

  useEffect(() => {
    setSelectedItems((prevItems) => {
      if (not(isEmpty(prevItems)) || isEmpty(currentReceipt?.items ?? [])) {
        return prevItems;
      }

      const newItems = {};
      currentReceipt.items.forEach((item) => {
        if (newItems[item.id]) {
          newItems[item.id][item.expirationId] = item.quantity;
        } else {
          newItems[item.id] = {
            [item.expirationId]: item.quantity,
          };
        }
      });

      return newItems;
    });
  }, [currentReceipt?.items]);

  return useMemo(
    () => ({
      isPending:
        isReceiptsContextPending || isOrdersContextPending || isStoragePending,
      items: sellItems,
      selectedItems,
      setSelectedItems,
      selectedOrderItems,
      setSelectedOrderItems,
      searchTerm,
      setSearchTerm,
      barCode,
      setBarCode,
      saveSelectedItemsInFlow,
      saveSelectedOrderItemsInFlow,
      resetUseSelectItems,
    }),
    [
      barCode,
      isOrdersContextPending,
      isReceiptsContextPending,
      isStoragePending,
      resetUseSelectItems,
      saveSelectedItemsInFlow,
      saveSelectedOrderItemsInFlow,
      searchTerm,
      selectedItems,
      selectedOrderItems,
      sellItems,
      setBarCode,
      setSearchTerm,
    ]
  );
}
