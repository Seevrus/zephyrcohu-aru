import { format, parseISO } from 'date-fns';
import { assocPath, isEmpty, isNil } from 'ramda';
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';

import useItems from '../../../api/queries/useItems';
import useStoreDetails from '../../../api/queries/useStoreDetails';
import useStores from '../../../api/queries/useStores';
import { useStorageContext } from '../../../providers/StorageProvider';

export type ListItem = {
  itemId: number;
  expirationId: number;
  name: string;
  expiresAt: string;
  itemBarcode: string;
  expirationBarcode: string;
  primaryStoreQuantity: number | undefined;
  originalQuantity: number | undefined;
  currentQuantity: number | undefined;
};

type SearchState = {
  searchTerm: string;
  barCode: string;
};

enum SearchStateActionKind {
  SetSearchTerm = 'SetSearchTerm',
  SetBarCode = 'SetBarCode',
}

type SearchStateAction = {
  type: SearchStateActionKind;
  payload: string;
};

function searchStateReducer(_: SearchState, action: SearchStateAction): SearchState {
  switch (action.type) {
    case SearchStateActionKind.SetSearchTerm:
      return {
        searchTerm: action.payload,
        barCode: '',
      };
    case SearchStateActionKind.SetBarCode:
      return {
        searchTerm: '',
        barCode: action.payload,
      };
    default:
      return {
        searchTerm: '',
        barCode: '',
      };
  }
}

export default function useSelectItemsFromStore() {
  const { data: itemsResponse } = useItems();
  const { storage, isLoading: isStorageLoading } = useStorageContext();
  const { data: stores, isLoading: isStoresLoading } = useStores();

  const primaryStoreId = stores?.find((store) => store.type === 'P')?.id;

  const { data: primaryStore, isLoading: isPrimaryStoreLoading } = useStoreDetails({
    storeId: primaryStoreId,
  });

  const [primaryStoreExpirations, setPrimaryStoreExpirations] = useState<
    Record<number, Record<number, number>>
  >({});
  const originalStorageExpirations = useRef<Record<number, Record<number, number>>>({});
  const [storageExpirations, setStorageExpirations] = useState<
    Record<number, Record<number, number>>
  >({});

  const [searchState, dispatchSearchState] = useReducer(searchStateReducer, {
    searchTerm: '',
    barCode: '',
  });

  const { searchTerm, barCode } = searchState;

  const setSearchTerm = useCallback(
    (payload: string) =>
      dispatchSearchState({ type: SearchStateActionKind.SetSearchTerm, payload }),
    []
  );
  const setBarCode = useCallback(
    (payload: string) => dispatchSearchState({ type: SearchStateActionKind.SetBarCode, payload }),
    []
  );

  useEffect(() => {
    setStorageExpirations((prevExpirations) => {
      if (!isEmpty(prevExpirations) || isNil(storage)) return prevExpirations;

      const expirations: Record<number, Record<number, number>> = {};

      storage.expirations.forEach((expiration) => {
        if (!expirations[expiration.itemId]) {
          expirations[expiration.itemId] = {};
        }
        expirations[expiration.itemId][expiration.expirationId] = expiration.quantity;
      });

      originalStorageExpirations.current = expirations;
      return expirations;
    });
  }, [storage]);

  useEffect(() => {
    setPrimaryStoreExpirations((prevExpirations) => {
      if (!isEmpty(prevExpirations) || isNil(primaryStore)) return prevExpirations;

      const expirations: Record<number, Record<number, number>> = {};

      primaryStore.expirations.forEach((expiration) => {
        if (!expirations[expiration.itemId]) {
          expirations[expiration.itemId] = {};
        }
        expirations[expiration.itemId][expiration.expirationId] = expiration.quantity;
      });

      return expirations;
    });
  }, [primaryStore]);

  const setCurrentQuantity = useCallback(
    (item: ListItem, newCurrentQuantity: number | null) => {
      const currentPrimaryStoreQuantity =
        primaryStoreExpirations[item.itemId]?.[item.expirationId] ?? 0;
      const currentQuantity = storageExpirations[item.itemId]?.[item.expirationId] ?? 0;

      const difference = (newCurrentQuantity || 0) - currentQuantity;

      setPrimaryStoreExpirations(
        assocPath([item.itemId, item.expirationId], currentPrimaryStoreQuantity - difference)
      );

      setStorageExpirations(
        assocPath([item.itemId, item.expirationId], currentQuantity + difference)
      );
    },
    [primaryStoreExpirations, storageExpirations]
  );

  const items: ListItem[] = useMemo(
    () =>
      itemsResponse
        ?.flatMap((item) =>
          item.expirations.map((expiration) => ({
            itemId: item.id,
            expirationId: expiration.id,
            name: item.name,
            expiresAt: format(parseISO(expiration.expiresAt), 'yyyy-MM'),
            itemBarcode: item.barcode ?? '',
            expirationBarcode: expiration.barcode ?? '',
            primaryStoreQuantity: primaryStoreExpirations[item.id]?.[expiration.id],
            originalQuantity: originalStorageExpirations.current[item.id]?.[expiration.id],
            currentQuantity: storageExpirations[item.id]?.[expiration.id],
          }))
        )
        .filter(
          (item) =>
            `${item.name.toLowerCase()}${item.expiresAt}`.includes(searchTerm.toLowerCase()) &&
            `${item.itemBarcode}${item.expirationBarcode}`.includes(barCode)
        )
        .sort((itemA, itemB) => itemA.name.localeCompare(itemB.name))
        .slice(0, 10),
    [barCode, itemsResponse, primaryStoreExpirations, searchTerm, storageExpirations]
  );

  return {
    isLoading: isStorageLoading || isPrimaryStoreLoading || isStoresLoading,
    items,
    setCurrentQuantity,
    searchTerm,
    setSearchTerm,
    barCode,
    setBarCode,
  };
}
