import AsyncStorage from '@react-native-async-storage/async-storage';
import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';

type ReceiptsContextType = {
  receipts: unknown[];
  numberOfReceipts: number;
};

const ReceiptsContext = createContext<ReceiptsContextType>({} as ReceiptsContextType);
const receiptsContextStorageKey = 'boreal-receipts-context';

export default function ReceiptsProvider({ children }: PropsWithChildren) {
  const [receipts, setReceipts] = useState<unknown[]>([]);
  const numberOfReceipts = receipts.length;

  /**
   * Initialize from local storage
   */
  useEffect(() => {
    async function setReceiptsFromLocalStorage() {
      const jsonData = await AsyncStorage.getItem(receiptsContextStorageKey);
      const localStorageReceipts = jsonData ? JSON.parse(jsonData) : [];
      setReceipts(localStorageReceipts);
    }

    setReceiptsFromLocalStorage();
  }, []);

  const receiptsContextValue = useMemo(
    () => ({ receipts, numberOfReceipts }),
    [numberOfReceipts, receipts]
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
