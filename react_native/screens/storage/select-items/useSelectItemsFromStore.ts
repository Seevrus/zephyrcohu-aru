import { format, parseISO } from 'date-fns';
import { isEmpty, isNil } from 'ramda';
import { useEffect, useMemo, useState } from 'react';

import useItems from '../../../api/queries/useItems';
import useStoreDetails from '../../../api/queries/useStoreDetails';
import useStores from '../../../api/queries/useStores';
import { useStorageContext } from '../../../providers/StorageProvider';

export type ListItem = {
  id: number;
  name: string;
  expiresAt: string;
  itemBarcode: string;
  expirationBarcode: string;
  primaryStoreQuantity: number;
  currentQuantity: number;
};

export default function useSelectItemsFromStore() {
  const { data: itemsResponse } = useItems();
  const { storage } = useStorageContext();
  const { data: stores } = useStores();

  const primaryStoreId = stores?.find((store) => store.type === 'P')?.id;

  const { data: primaryStore } = useStoreDetails({ storeId: primaryStoreId });

  const [primaryStoreExpirations, setPrimaryStoreExpirations] = useState<
    Record<number, Record<number, number>>
  >({});
  const [storageExpirations, setStorageExpirations] = useState<
    Record<number, Record<number, number>>
  >({});

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

  const items: ListItem[] = useMemo(
    () =>
      itemsResponse
        ?.flatMap((item) =>
          item.expirations.map((expiration) => ({
            id: expiration.id,
            name: item.name,
            expiresAt: format(parseISO(expiration.expiresAt), 'yyyy-MM'),
            itemBarcode: item.barcode ?? '',
            expirationBarcode: expiration.barcode ?? '',
            primaryStoreQuantity: primaryStoreExpirations[item.id]?.[expiration.id] ?? 0,
            currentQuantity: storageExpirations[item.id]?.[expiration.id] ?? 0,
          }))
        )
        .sort((itemA, itemB) => itemA.name.localeCompare(itemB.name)),
    [itemsResponse, primaryStoreExpirations, storageExpirations]
  );

  return { items };
}
