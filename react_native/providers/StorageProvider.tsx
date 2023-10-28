import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetInfo } from '@react-native-community/netinfo';
import { assoc, flatten, isNil, map, pipe, toPairs } from 'ramda';
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import useSellSelectedItems from '../api/mutations/useSellSelectedItems';
import useCheckToken from '../api/queries/useCheckToken';
import useStoreDetails from '../api/queries/useStoreDetails';
import { StoreDetailsResponseData } from '../api/response-types/StoreDetailsResponseType';

type StorageContextType = {
  isPending: boolean;
  storage: StoreDetailsResponseData | null;
  originalStorage: StoreDetailsResponseData | null;
  slowSaveStorageExpirations: (storageExpirations: Record<number, Record<number, number>>) => void;
  removeSoldItemsFromStorage: (soldItems: Record<number, Record<number, number>>) => Promise<void>;
  clearStorageFromContext(): void;
};

const StorageContext = createContext<StorageContextType>({} as StorageContextType);
const storageContextKey = 'boreal-storage-context';

export default function StorageProvider({ children }: PropsWithChildren) {
  const { isInternetReachable } = useNetInfo();

  const { data: user } = useCheckToken();
  const { mutateAsync: updateStorageAPI } = useSellSelectedItems();
  const {
    data: storeDetails,
    isPending: isStoreDetailsPending,
    isStale: isStoreDetailsStale,
  } = useStoreDetails({
    storeId: user?.storeId,
  });

  const [isLocalStorageLoaded, setIsLocalStorageLoaded] = useState<boolean>(false);
  const [storage, setStorage] = useState<StoreDetailsResponseData | null>(null);

  /**
   * Callback to set storage from the drive.
   */
  const persistStorage = useCallback(async (storageToPersist: StoreDetailsResponseData) => {
    await AsyncStorage.setItem(storageContextKey, JSON.stringify(storageToPersist));
  }, []);

  /**
   * Callback to clear storage (drive and memory).
   */
  const clearStorageFromContext = useCallback(async () => {
    await AsyncStorage.removeItem(storageContextKey);
    setStorage(null);
  }, []);

  /**
   * Save storage from storage flow. Slow because it will trigger a storage persist.
   */
  const slowSaveStorageExpirations = useCallback(
    async (storageExpirations: Record<number, Record<number, number>>) => {
      const updatedStorage = assoc(
        'expirations',
        pipe(
          toPairs<typeof storageExpirations>,
          map(([itemId, itemExpirations]) =>
            pipe(
              toPairs<(typeof storageExpirations)[number]>,
              map(([expirationId, quantity]) => ({
                itemId: Number(itemId),
                expirationId: Number(expirationId),
                quantity,
              }))
            )(itemExpirations)
          ),
          flatten
        )(storageExpirations),
        storage
      );

      await persistStorage(updatedStorage);
      setStorage(updatedStorage);
    },
    [persistStorage, storage]
  );

  /**
   * Remove sold items from storage
   */
  const removeSoldItemsFromStorage = useCallback(
    async (soldItems: Record<number, Record<number, number>>) => {
      const updatedStorage: StoreDetailsResponseData = {
        ...storage,
        expirations: storage.expirations.map((expiration) => {
          const soldItemQuantity = soldItems?.[expiration.itemId]?.[expiration.expirationId];

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

      await persistStorage(updatedStorage);
      setStorage(updatedStorage);
    },
    [isInternetReachable, persistStorage, storage, updateStorageAPI]
  );

  /**
   * Initialize from local storage.
   */
  useEffect(() => {
    AsyncStorage.getItem(storageContextKey).then((storageBackupJson) => {
      const localStorageValue = storageBackupJson ? JSON.parse(storageBackupJson) : null;
      setStorage(localStorageValue);
      setIsLocalStorageLoaded(true);
    });
  }, []);

  /**
   * Initialize from API response if it has not already been initialized.
   */
  useEffect(() => {
    if (isLocalStorageLoaded && isNil(storage) && !isStoreDetailsStale && !!storeDetails) {
      setStorage(storeDetails);
    }
  }, [isLocalStorageLoaded, isStoreDetailsStale, storage, storeDetails]);

  /**
   * Clear context if the user's store id does not match with the store's id.
   */
  useEffect(() => {
    if (user && storage && user.storeId !== storage.id) {
      setStorage(null);
      clearStorageFromContext();
    }
  }, [clearStorageFromContext, storage, user]);

  const storageContextValue = useMemo(
    () => ({
      isPending: isStoreDetailsPending,
      storage,
      originalStorage: storeDetails,
      slowSaveStorageExpirations,
      clearStorageFromContext,
      removeSoldItemsFromStorage,
    }),
    [
      clearStorageFromContext,
      isStoreDetailsPending,
      removeSoldItemsFromStorage,
      slowSaveStorageExpirations,
      storage,
      storeDetails,
    ]
  );

  return <StorageContext.Provider value={storageContextValue}>{children}</StorageContext.Provider>;
}

export function useStorageContext() {
  const storageContext = useContext(StorageContext);

  if (storageContext === undefined) {
    throw new Error('useStorageContext must be used within StorageProvider.');
  }

  return storageContext;
}
