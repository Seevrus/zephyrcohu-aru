import AsyncStorage from '@react-native-async-storage/async-storage';
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

import useCheckToken from '../api/queries/useCheckToken';
import useStoreDetails from '../api/queries/useStoreDetails';
import { StoreDetailsResponseData } from '../api/response-types/StoreDetailsResponseType';

type StorageContextType = {
  isLoading: boolean;
  storage: StoreDetailsResponseData | null;
  originalStorage: StoreDetailsResponseData | null;
  saveStorageExpirations: (storageExpirations: Record<number, Record<number, number>>) => void;
  clearStorageFromContext(): void;
};

const StorageContext = createContext<StorageContextType>({} as StorageContextType);
const storageContextKey = 'boreal-storage-context';

export default function StorageProvider({ children }: PropsWithChildren) {
  const { data: user } = useCheckToken();
  const [storage, setStorage] = useState<StoreDetailsResponseData | null>(null);

  const {
    data: storeDetails,
    isLoading: isStoreDetailsLoading,
    isStale: isStoreDetailsStale,
  } = useStoreDetails({
    storeId: user?.storeId,
  });

  /**
   * Clear storage when storaging or round is finished - TODO
   */
  const clearStorageFromContext = useCallback(() => {
    AsyncStorage.removeItem(storageContextKey).then(() => {
      setStorage(null);
    });
  }, []);

  /**
   * Save storage from storage flow
   */
  const saveStorageExpirations = useCallback(
    (storageExpirations: Record<number, Record<number, number>>) => {
      setStorage(
        assoc(
          'expirations',
          pipe(
            toPairs<(typeof storageExpirations)[number]>,
            map(([itemId, itemExpirations]) =>
              pipe(
                toPairs<(typeof storageExpirations)[number][number]>,
                map(([expirationId, quantity]) => ({
                  itemId: Number(itemId),
                  expirationId: Number(expirationId),
                  quantity,
                }))
              )(itemExpirations)
            ),
            flatten
          )(storageExpirations)
        )
      );
    },
    []
  );

  /**
   * Initialize from local storage
   */
  useEffect(() => {
    async function setStorageFromLocal() {
      const jsonValue = await AsyncStorage.getItem(storageContextKey);
      const localStorageValue = jsonValue ? JSON.parse(jsonValue) : null;

      setStorage(localStorageValue);
    }

    setStorageFromLocal();
  }, []);

  /**
   * Initialize from API response if it has not already been initialized
   */
  useEffect(() => {
    if (isNil(storage) && !isStoreDetailsStale && !!storeDetails) {
      setStorage(storeDetails);
    }
  }, [isStoreDetailsStale, storage, storeDetails]);

  /**
   * Save state changes to local storage
   */
  useEffect(() => {
    async function saveAndSetStorage() {
      await AsyncStorage.setItem(storageContextKey, JSON.stringify(storage));
    }

    if (storage) {
      saveAndSetStorage();
    }
  }, [storage]);

  /**
   * Clear context if the user's store id does not match with the store's id
   */
  useEffect(() => {
    if (user && storage && user.storeId !== storage.id) {
      setStorage(null);
      clearStorageFromContext();
    }
  }, [clearStorageFromContext, storage, user]);

  const storageContextValue = useMemo(
    () => ({
      isLoading: isStoreDetailsLoading,
      storage,
      originalStorage: storeDetails,
      saveStorageExpirations,
      clearStorageFromContext,
    }),
    [clearStorageFromContext, isStoreDetailsLoading, saveStorageExpirations, storage, storeDetails]
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
