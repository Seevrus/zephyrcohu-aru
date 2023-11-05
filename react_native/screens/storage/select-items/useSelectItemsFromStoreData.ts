import { format, parseISO } from 'date-fns';
import { useAtom, useAtomValue } from 'jotai';
import { filter, pipe, prop, sortBy, take, when } from 'ramda';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useItems } from '../../../api/queries/useItems';
import {
  primaryStoreAtom,
  selectedStoreAtom,
  selectedStoreInitialStateAtom,
} from '../../../atoms/storage';
import {
  storageListItemsAtom,
  type StorageListItem,
} from '../../../atoms/storageFlow';

export function useSelectItemsFromStoreData() {
  const { data: items, isPending: isItemsPending } = useItems();

  const primaryStoreDetails = useAtomValue(primaryStoreAtom);
  const selectedStoreInitialState = useAtomValue(selectedStoreInitialStateAtom);
  const selectedStoreDetails = useAtomValue(selectedStoreAtom);

  const [storageListItems, setStorageListItems] = useAtom(storageListItemsAtom);

  const [searchState, setSearchState] = useState({
    searchTerm: '',
    barCode: '',
  });

  const isAnyItemChanged = useMemo(
    () =>
      storageListItems?.some(
        (item) => item.currentQuantity !== item.originalQuantity
      ),
    [storageListItems]
  );

  useEffect(() => {
    setStorageListItems(
      (items ?? []).flatMap<StorageListItem>((item) =>
        item.expirations.map((expiration) => ({
          itemId: item.id,
          expirationId: expiration.id,
          articleNumber: item.articleNumber,
          name: item.name,
          expiresAt: format(parseISO(expiration.expiresAt), 'yyyy-MM'),
          itemBarcode: item.barcode ?? '',
          expirationBarcode: expiration.barcode ?? '',
          unitName: item.unitName,
          primaryStoreQuantity: primaryStoreDetails?.expirations.find(
            (exp) =>
              exp.itemId === item.id && exp.expirationId === expiration.id
          )?.quantity,
          originalQuantity: selectedStoreInitialState?.expirations.find(
            (exp) =>
              exp.itemId === item.id && exp.expirationId === expiration.id
          )?.quantity,
          currentQuantity: selectedStoreDetails?.expirations.find(
            (exp) =>
              exp.itemId === item.id && exp.expirationId === expiration.id
          )?.quantity,
        }))
      )
    );
  }, [
    items,
    primaryStoreDetails?.expirations,
    selectedStoreDetails?.expirations,
    selectedStoreInitialState?.expirations,
    setStorageListItems,
  ]);

  const itemsToShow = useMemo(
    () =>
      pipe(
        when(
          () => !!searchState.searchTerm || !!searchState.barCode,
          filter<StorageListItem>(
            (item) =>
              `${item.name.toLowerCase()}${item.expiresAt}`.includes(
                searchState.searchTerm.toLowerCase()
              ) &&
              `${item.itemBarcode}${item.expirationBarcode}`.includes(
                searchState.barCode
              )
          )
        ),
        sortBy<StorageListItem>(prop('name')),
        (items) => take(10, items)
      )(storageListItems ?? []),
    [searchState.barCode, searchState.searchTerm, storageListItems]
  );

  const setCurrentQuantity = useCallback(
    (itemToSet: StorageListItem, newCurrentQuantity: number | null) => {
      setStorageListItems((prevItems) => {
        if (!prevItems) {
          return prevItems;
        }

        return prevItems.map((item) =>
          item.itemId === itemToSet.itemId &&
          item.expirationId === itemToSet.expirationId
            ? {
                ...item,
                primaryStoreQuantity:
                  (item.primaryStoreQuantity ?? 0) -
                  ((newCurrentQuantity ?? 0) - (item.currentQuantity ?? 0)),
                currentQuantity: newCurrentQuantity ?? undefined,
              }
            : item
        );
      });
    },
    [setStorageListItems]
  );

  return {
    isLoading: isItemsPending,
    searchState,
    setSearchState,
    itemsToShow,
    isAnyItemChanged,
    setCurrentQuantity,
  };
}
