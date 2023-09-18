import { format, parseISO } from 'date-fns';
import { assocPath, isEmpty, isNil } from 'ramda';
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';

import useSaveSelectedItems from '../api/mutations/useSaveSelectedItems';
import useItems from '../api/queries/useItems';
import useStoreDetails from '../api/queries/useStoreDetails';
import useStores from '../api/queries/useStores';
import { useStorageContext } from './StorageProvider';

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

type StorageFlowContextType = {
  isLoading: boolean;
  items: ListItem[];
  isAnyItemChanged: boolean;
  setCurrentQuantity: (item: ListItem, newCurrentQuantity: number | null) => void;
  searchTerm: string;
  setSearchTerm: (payload: string) => void;
  barCode: string;
  setBarCode: (payload: string) => void;
  handleSendChanges: () => Promise<void>;
};

const StorageFlowContext = createContext<StorageFlowContextType>({} as StorageFlowContextType);

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

export default function StorageFlowProvider({ children }: PropsWithChildren) {
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
  const finalStorageExpirations = useRef<Record<number, Record<number, number>>>({});

  const { mutateAsync: saveSelectedItems } = useSaveSelectedItems();

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

  const isAnyItemChanged = useMemo(
    () => items?.some((item) => item.currentQuantity !== item.originalQuantity),
    [items]
  );

  const handleSendChanges = useCallback(async () => {
    finalStorageExpirations.current = storageExpirations;
    await saveSelectedItems(storageExpirations);
  }, [saveSelectedItems, storageExpirations]);

  const selectItemsContextValue = useMemo(
    () => ({
      isLoading: isStorageLoading || isPrimaryStoreLoading || isStoresLoading,
      items,
      isAnyItemChanged,
      setCurrentQuantity,
      searchTerm,
      setSearchTerm,
      barCode,
      setBarCode,
      handleSendChanges,
    }),
    [
      barCode,
      handleSendChanges,
      isAnyItemChanged,
      isPrimaryStoreLoading,
      isStorageLoading,
      isStoresLoading,
      items,
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
    throw new Error('useSelectItemsContext must be used within SelectItemsProvider.');
  }

  return selectItemsContext;
}
