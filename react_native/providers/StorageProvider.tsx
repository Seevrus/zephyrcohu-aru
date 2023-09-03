import AsyncStorage from '@react-native-async-storage/async-storage';
import { isNil } from 'ramda';
import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';

import useStoreDetails from '../api/queries/useStoreDetails';
import { StoreDetailsResponseData } from '../api/response-types/StoreDetailsResponseType';
import { useUserContext } from './UserProvider';

type StorageContextType = {
  storage: StoreDetailsResponseData | null;
  clearStorageFromContext(): void;
};

const StorageContext = createContext<StorageContextType>({} as StorageContextType);
const storageContextKey = 'boreal-storage-context';

export default function StorageProvider({ children }: PropsWithChildren) {
  const { user } = useUserContext();
  const [storage, setStorage] = useState<StoreDetailsResponseData | null>(null);

  const { data: storeDetails } = useStoreDetails({ storeId: user?.storeId });

  /**
   * Clear storage when storaging or round is finished - TODO
   */
  function clearStorageFromContext() {
    AsyncStorage.removeItem(storageContextKey).then(() => {
      setStorage(null);
    });
  }

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
    if (isNil(storage) && !!storeDetails) {
      setStorage(storeDetails);
    }
  }, [storage, storeDetails]);

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
      clearStorageFromContext();
    }
  }, [storage, user]);

  const storageContextValue = useMemo(() => ({ storage, clearStorageFromContext }), [storage]);

  return <StorageContext.Provider value={storageContextValue}>{children}</StorageContext.Provider>;
}

export function useStorageContext() {
  const storageContext = useContext(StorageContext);

  if (storageContext === undefined) {
    throw new Error('useStorageContext must be used within StorageProvider.');
  }

  return storageContext;
}
