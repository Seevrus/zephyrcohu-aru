import { format, parseISO } from 'date-fns';
import { assocPath, isEmpty, isNil } from 'ramda';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type PropsWithChildren,
} from 'react';

import { useSaveSelectedItems } from '../api/mutations/useSaveSelectedItems';
import { useItems } from '../api/queries/useItems';
import { useStoreDetails } from '../api/queries/useStoreDetails';
import { useStores } from '../api/queries/useStores';
import {
  itemsSearchReducer,
  SearchStateActionKind,
} from '../hooks/itemsSearchReducer';
import { useStorageContext } from './StorageProvider';

export type ListItem = {
  itemId: number;
  expirationId: number;
  articleNumber: string;
  name: string;
  expiresAt: string;
  itemBarcode: string;
  expirationBarcode: string;
  unitName: string;
  primaryStoreQuantity: number | undefined;
  originalQuantity: number | undefined;
  currentQuantity: number | undefined;
};

type StorageFlowContextType = {
  isPending: boolean;
  items: ListItem[];
  areModificationsSaved: boolean;
  setCurrentQuantity: (
    item: ListItem,
    newCurrentQuantity: number | null
  ) => void;
  searchTerm: string;
  setSearchTerm: (payload: string) => void;
  barCode: string;
  setBarCode: (payload: string) => void;
  handleSendChanges: () => Promise<void>;
  resetStorageFlowContext: () => void;
};

const StorageFlowContext = createContext<StorageFlowContextType>(
  {} as StorageFlowContextType
);

export function StorageFlowProvider({ children }: PropsWithChildren) {
  const { data: itemsResponse } = useItems();
  const {
    storage,
    originalStorage,
    isPending: isStoragePending,
    slowSaveStorageExpirations,
  } = useStorageContext();
  const { data: stores, isPending: isStoresPending } = useStores();

  const primaryStoreId = stores?.find((store) => store.type === 'P')?.id;

  const { data: primaryStore, isPending: isPrimaryStorePending } =
    useStoreDetails({
      storeId: primaryStoreId,
    });

  const [primaryStoreExpirations, setPrimaryStoreExpirations] = useState<
    Record<number, Record<number, number>>
  >({});
  const [originalStorageExpirations, setOriginalStorageExpirations] = useState<
    Record<number, Record<number, number>>
  >({});
  const [storageExpirations, setStorageExpirations] = useState<
    Record<number, Record<number, number>>
  >({});

  const [areModificationsSaved, setAreModificationsSaved] =
    useState<boolean>(false);

  const { mutateAsync: saveSelectedItems } = useSaveSelectedItems();

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

  useEffect(() => {
    setOriginalStorageExpirations((prevExpirations) => {
      if (!isEmpty(prevExpirations) || isNil(originalStorage))
        return prevExpirations;

      const originalExpirations: Record<number, Record<number, number>> = {};

      originalStorage.expirations.forEach((expiration) => {
        if (!originalExpirations[expiration.itemId]) {
          originalExpirations[expiration.itemId] = {};
        }
        originalExpirations[expiration.itemId][expiration.expirationId] =
          expiration.quantity;
      });

      return originalExpirations;
    });
  }, [originalStorage]);

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
    setPrimaryStoreExpirations((prevExpirations) => {
      if (!isEmpty(prevExpirations) || isNil(primaryStore))
        return prevExpirations;

      const expirations: Record<number, Record<number, number>> = {};

      primaryStore.expirations.forEach((expiration) => {
        if (!expirations[expiration.itemId]) {
          expirations[expiration.itemId] = {};
        }
        expirations[expiration.itemId][expiration.expirationId] =
          expiration.quantity;
      });

      return expirations;
    });
  }, [primaryStore]);

  const setCurrentQuantity = useCallback(
    (item: ListItem, newCurrentQuantity: number | null) => {
      const currentPrimaryStoreQuantity =
        primaryStoreExpirations[item.itemId]?.[item.expirationId] ?? 0;
      const currentQuantity =
        storageExpirations[item.itemId]?.[item.expirationId] ?? 0;

      const difference = (newCurrentQuantity || 0) - currentQuantity;

      setPrimaryStoreExpirations(
        assocPath(
          [item.itemId, item.expirationId],
          currentPrimaryStoreQuantity - difference
        )
      );

      setStorageExpirations(
        assocPath(
          [item.itemId, item.expirationId],
          currentQuantity + difference
        )
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
            articleNumber: item.articleNumber,
            name: item.name,
            expiresAt: format(parseISO(expiration.expiresAt), 'yyyy-MM'),
            itemBarcode: item.barcode ?? '',
            expirationBarcode: expiration.barcode ?? '',
            unitName: item.unitName,
            primaryStoreQuantity:
              primaryStoreExpirations[item.id]?.[expiration.id],
            originalQuantity:
              originalStorageExpirations[item.id]?.[expiration.id],
            currentQuantity: storageExpirations[item.id]?.[expiration.id],
          }))
        )
        .filter(
          (item) =>
            `${item.name.toLowerCase()}${item.expiresAt}`.includes(
              searchTerm.toLowerCase()
            ) &&
            `${item.itemBarcode}${item.expirationBarcode}`.includes(barCode)
        )
        .sort((itemA, itemB) => itemA.name.localeCompare(itemB.name, 'HU-hu')),
    [
      barCode,
      itemsResponse,
      originalStorageExpirations,
      primaryStoreExpirations,
      searchTerm,
      storageExpirations,
    ]
  );

  const handleSendChanges = useCallback(async () => {
    slowSaveStorageExpirations(storageExpirations);
    dispatchSearchState({
      type: SearchStateActionKind.ClearSearch,
      payload: '',
    });
    await saveSelectedItems(storageExpirations);
    setAreModificationsSaved(true);
  }, [saveSelectedItems, slowSaveStorageExpirations, storageExpirations]);

  const resetStorageFlowContext = useCallback(() => {
    setPrimaryStoreExpirations({});
    setOriginalStorageExpirations({});
    setStorageExpirations({});
    dispatchSearchState({
      type: SearchStateActionKind.ClearSearch,
      payload: '',
    });
    setAreModificationsSaved(false);
  }, []);

  const selectItemsContextValue = useMemo(
    () => ({
      isPending: isStoragePending || isPrimaryStorePending || isStoresPending,
      items,
      areModificationsSaved,
      setCurrentQuantity,
      searchTerm,
      setSearchTerm,
      barCode,
      setBarCode,
      handleSendChanges,
      resetStorageFlowContext,
    }),
    [
      areModificationsSaved,
      barCode,
      handleSendChanges,
      isPrimaryStorePending,
      isStoragePending,
      isStoresPending,
      items,
      resetStorageFlowContext,
      searchTerm,
      setBarCode,
      setCurrentQuantity,
      setSearchTerm,
    ]
  );

  return (
    <StorageFlowContext.Provider value={selectItemsContextValue}>
      {children}
    </StorageFlowContext.Provider>
  );
}

export function useStorageFlowContext() {
  const selectItemsContext = useContext(StorageFlowContext);

  if (selectItemsContext === undefined) {
    throw new Error(
      'useStorageFlowContext must be used within StorageFlowProvider.'
    );
  }

  return selectItemsContext;
}
