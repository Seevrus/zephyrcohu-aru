import AsyncStorage from '@react-native-async-storage/async-storage';
import { assoc, dissoc, isNil } from 'ramda';
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ReceiptBuyer,
  ReceiptItem,
  ReceiptOtherItem,
  ReceiptRequest,
} from '../api/request-types/CreateReceiptsRequest';
import useCheckToken from '../api/queries/useCheckToken';

export type SelectedDiscount = {
  id: number;
  quantity: number;
  name: string;
} & (
  | {
      type: 'absolute' | 'percentage';
      amount: number;
      price?: undefined;
    }
  | {
      type: 'freeForm';
      amount?: undefined;
      price: number;
    }
);

type ContextReceiptItem = ReceiptItem & {
  discounts?: SelectedDiscount[];
};

type ContextReceipt = Omit<ReceiptRequest, 'items'> & {
  items: ContextReceiptItem[];
};

type ReceiptsContextType = {
  receipts: ContextReceipt[];
  numberOfReceipts: number;
  currentReceipt: Partial<ContextReceipt>;
  resetCurrentReceipt: () => Promise<void>;
  setCurrentReceiptBuyer: (buyer: ReceiptBuyer) => Promise<void>;
  setCurrentReceiptItems: (items: ContextReceiptItem[]) => Promise<void>;
  setCurrentReceiptOtherItems: (otherItems?: ReceiptOtherItem[]) => Promise<void>;
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

  const setCurrentReceiptItems = useCallback(
    async (items: ReceiptItem[]) => {
      setCurrentReceipt(assoc('items', items));
      const updatedReceipt = assoc('items', items, currentReceipt);
      await persistCurrentReceipt(updatedReceipt);
    },
    [currentReceipt, persistCurrentReceipt]
  );

  const setCurrentReceiptOtherItems = useCallback(
    async (otherItems?: ReceiptOtherItem[]) => {
      if (otherItems) {
        setCurrentReceipt(assoc('otherItems', otherItems));
        const updatedReceipt = assoc('otherItems', otherItems, currentReceipt);
        await persistCurrentReceipt(updatedReceipt);
      } else {
        setCurrentReceipt(dissoc('otherItems'));
        const updatedReceipt = dissoc('otherItems', currentReceipt);
        await persistCurrentReceipt(updatedReceipt);
      }
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
      setCurrentReceiptItems,
      setCurrentReceiptOtherItems,
    }),
    [
      currentReceipt,
      numberOfReceipts,
      receipts,
      resetCurrentReceipt,
      setCurrentReceiptBuyer,
      setCurrentReceiptItems,
      setCurrentReceiptOtherItems,
    ]
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
