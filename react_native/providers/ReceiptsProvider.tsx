import AsyncStorage from '@react-native-async-storage/async-storage';
import { assoc, isNil } from 'ramda';
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { ReceiptBuyer, ReceiptRequest } from '../api/request-types/CreateReceiptsRequest';
import useCheckToken from '../api/queries/useCheckToken';

type ReceiptsContextType = {
  receipts: ReceiptRequest[];
  numberOfReceipts: number;
  currentReceipt: Partial<ReceiptRequest>;
  resetCurrentReceipt: () => Promise<void>;
  setCurrentReceiptBuyer: (buyer: ReceiptBuyer) => Promise<void>;
};

const ReceiptsContext = createContext<ReceiptsContextType>({} as ReceiptsContextType);
const receiptsContextStorageKey = 'boreal-receipts-context';
const currentReceiptContextStorageKey = 'bureal-current-receipt-context';

export default function ReceiptsProvider({ children }: PropsWithChildren) {
  const { data: user } = useCheckToken();

  const [receipts, setReceipts] = useState<ReceiptRequest[]>(null);
  const numberOfReceipts = receipts?.length ?? 0;
  const [currentReceipt, setCurrentReceipt] = useState<Partial<ReceiptRequest>>(null);

  const isRoundStarted = user?.state === 'R';

  /**
   * Initialize receipts from local storage
   */
  useEffect(() => {
    async function setReceiptsFromLocalStorage() {
      const jsonData = await AsyncStorage.getItem(receiptsContextStorageKey);
      const localStorageReceipts = jsonData ? JSON.parse(jsonData) : [];
      setReceipts(localStorageReceipts);
    }

    if (isNil(receipts)) {
      setReceiptsFromLocalStorage();
    }
  }, [receipts]);

  /**
   * Persist receipts to local storage
   */
  async function persistReceipts() {
    await AsyncStorage.setItem(receiptsContextStorageKey, JSON.stringify(receipts));
  }

  /**
   * Initialize current receipt from local storage
   */
  useEffect(() => {
    async function setCurrentReceiptFromLocalStorage() {
      const jsonData = await AsyncStorage.getItem(currentReceiptContextStorageKey);
      const localStorageCurrentReceipt = jsonData ? JSON.parse(jsonData) : {};
      setCurrentReceipt(localStorageCurrentReceipt);
    }

    if (isRoundStarted && isNil(currentReceipt)) {
      setCurrentReceiptFromLocalStorage();
    }
  }, [currentReceipt, isRoundStarted]);

  /**
   * Persist current receipt to local storage
   */
  const persistCurrentReceipt = useCallback(
    async (receipt?: Partial<ReceiptRequest>) => {
      await AsyncStorage.setItem(
        currentReceiptContextStorageKey,
        JSON.stringify(receipt ?? currentReceipt)
      );
    },
    [currentReceipt]
  );

  const resetCurrentReceipt = useCallback(async () => {
    await AsyncStorage.removeItem(currentReceiptContextStorageKey);
    setCurrentReceipt(null);
  }, []);

  const setCurrentReceiptBuyer = useCallback(
    async (buyer: ReceiptBuyer) => {
      setCurrentReceipt(assoc('buyer', buyer));
      const updatedReceipt = assoc('buyer', buyer, currentReceipt);
      await persistCurrentReceipt(updatedReceipt);
    },
    [currentReceipt, persistCurrentReceipt]
  );

  const receiptsContextValue = useMemo(
    () => ({
      receipts,
      numberOfReceipts,
      currentReceipt,
      resetCurrentReceipt,
      setCurrentReceiptBuyer,
    }),
    [currentReceipt, numberOfReceipts, receipts, resetCurrentReceipt, setCurrentReceiptBuyer]
  );

  return (
    <ReceiptsContext.Provider value={receiptsContextValue}>{children}</ReceiptsContext.Provider>
  );
}

export function useReceiptsContext() {
  const receiptsContext = useContext(ReceiptsContext);

  if (receiptsContext === undefined) {
    throw new Error('useReceiptsContext must be used within ReceiptsProvider.');
  }

  return receiptsContext;
}
