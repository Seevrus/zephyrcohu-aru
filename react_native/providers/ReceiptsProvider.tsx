import AsyncStorage from '@react-native-async-storage/async-storage';
import { add, format, parseISO } from 'date-fns';
import { append, assoc, dissoc, isEmpty, isNil } from 'ramda';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { useCreateReceipts } from '../api/mutations/useCreateReceipts';
import { useUpdateReceipts } from '../api/mutations/useUpdateReceipts';
import { useActiveRound } from '../api/queries/useActiveRound';
import { useCheckToken } from '../api/queries/useCheckToken';
import { type ReceiptBuyer } from '../api/request-types/common/ReceiptBuyer';
import { type ReceiptOtherItem } from '../api/request-types/common/ReceiptItemsTypes';
import { calculateReceiptTotals } from '../utils/calculateReceiptTotals';
import { useStorageContext } from './StorageProvider';
import {
  type ContextReceipt,
  type ContextReceiptItem,
} from './types/receipts-provider-types';

type ReceiptsContextType = {
  isPending: boolean;
  receipts: ContextReceipt[];
  numberOfReceipts: number;
  currentReceipt: Partial<ContextReceipt>;
  resetCurrentReceipt: () => Promise<void>;
  setCurrentReceiptBuyer: ({
    partnerCode,
    partnerSiteCode,
    buyer,
    paymentDays,
    invoiceType,
  }: {
    partnerCode: string;
    partnerSiteCode: string;
    buyer: ReceiptBuyer;
    paymentDays: number;
    invoiceType: 'P' | 'E';
  }) => Promise<void>;
  setCurrentReceiptItems: (items: ContextReceiptItem[]) => Promise<void>;
  setCurrentReceiptOtherItems: (
    otherItems?: ReceiptOtherItem[]
  ) => Promise<void>;
  finalizeCurrentReceipt: () => Promise<void>;
  sendInReceipts: () => Promise<void>;
  updateNumberOfPrintedCopies: (receiptId: number) => Promise<void>;
};

const ReceiptsContext = createContext<ReceiptsContextType>(
  {} as ReceiptsContextType
);
const receiptsContextStorageKey = 'boreal-receipts-context';
const currentReceiptContextStorageKey = 'boreal-current-receipt-context';

export function ReceiptsProvider({ children }: PropsWithChildren) {
  const { data: activeRound, isPending: isActiveRoundPending } =
    useActiveRound();
  const { data: user, isPending: isUserPending } = useCheckToken();
  const { isPending: isCreateReceiptsPending, mutateAsync: createReceiptsAPI } =
    useCreateReceipts();
  const { storage, isPending: isStoreDetailsPending } = useStorageContext();
  const { mutateAsync: updateReceiptsAPI } = useUpdateReceipts();

  const [receipts, setReceipts] = useState<ContextReceipt[]>(null);
  const numberOfReceipts = receipts?.length ?? 0;
  const [currentReceipt, setCurrentReceipt] =
    useState<Partial<ContextReceipt>>(null);
  const [isReceiptsSyncInProgress, setIsReceiptsSyncInProgress] =
    useState<boolean>(isCreateReceiptsPending);

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
  const persistReceipts = useCallback(
    async (receiptsToSave: ContextReceipt[]) => {
      await AsyncStorage.setItem(
        receiptsContextStorageKey,
        JSON.stringify(receiptsToSave)
      );
    },
    []
  );

  /**
   * Initialize current receipt from local storage
   */
  useEffect(() => {
    if (isRoundStarted && isNil(currentReceipt)) {
      AsyncStorage.getItem(currentReceiptContextStorageKey).then((jsonData) => {
        const localStorageCurrentReceipt = jsonData ? JSON.parse(jsonData) : {};
        setCurrentReceipt(localStorageCurrentReceipt);
      });
    }
  }, [currentReceipt, isRoundStarted]);

  /**
   * Persist current receipt to local storage
   */
  const persistCurrentReceipt = useCallback(
    async (receipt?: Partial<ContextReceipt>) => {
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
    async ({
      partnerCode,
      partnerSiteCode,
      buyer,
      paymentDays,
      invoiceType,
    }: {
      partnerCode: string;
      partnerSiteCode: string;
      buyer: ReceiptBuyer;
      paymentDays: number;
      invoiceType: 'P' | 'E';
    }) => {
      const invoiceDate = parseISO(activeRound.roundStarted);
      const fulfillmentDate = add(invoiceDate, { days: paymentDays });
      const paidDate = fulfillmentDate;

      const dateFormat = 'yyyy-MM-dd';

      setCurrentReceipt((prevState) => ({
        ...prevState,
        partnerCode,
        partnerSiteCode,
        buyer,
        invoiceDate: format(invoiceDate, dateFormat),
        fulfillmentDate: format(fulfillmentDate, dateFormat),
        invoiceType,
        paidDate: format(paidDate, dateFormat),
      }));

      const updatedReceipt = {
        ...currentReceipt,
        partnerCode,
        partnerSiteCode,
        buyer,
        invoiceDate: format(invoiceDate, dateFormat),
        fulfillmentDate: format(fulfillmentDate, dateFormat),
        invoiceType,
        paidDate: format(paidDate, dateFormat),
      };
      await persistCurrentReceipt(updatedReceipt);
    },
    [activeRound?.roundStarted, currentReceipt, persistCurrentReceipt]
  );

  const setCurrentReceiptItems = useCallback(
    async (items: ContextReceiptItem[]) => {
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

  const finalizeCurrentReceipt = useCallback(async () => {
    const serialNumber = isEmpty(receipts)
      ? storage.firstAvailableSerialNumber
      : receipts.reduce(
          (sn, { serialNumber: receiptSn }) =>
            receiptSn > sn ? receiptSn : sn,
          0
        ) + 1;

    const receiptTotals = calculateReceiptTotals({
      items: currentReceipt.items,
      otherItems: currentReceipt.otherItems,
    });

    const roundedAmount =
      currentReceipt.invoiceType === 'P'
        ? Math.round(receiptTotals.grossAmount / 5) * 5
        : receiptTotals.grossAmount;
    const roundAmount = roundedAmount - receiptTotals.grossAmount;

    const finalReceipt = {
      ...currentReceipt,
      isSent: false,
      shouldBeUpdated: false,
      serialNumber,
      yearCode: storage.yearCode,
      originalCopiesPrinted: 0,
      vendor: {
        name: user.company.name,
        country: user.company.country,
        postalCode: user.company.postalCode,
        city: user.company.city,
        address: user.company.address,
        felir: user.company.felir,
        iban: user.company.iban,
        bankAccount: user.company.bankAccount,
        vatNumber: user.company.vatNumber,
      },
      ...receiptTotals,
      roundAmount,
      roundedAmount,
    } as ContextReceipt;

    setCurrentReceipt(finalReceipt);
    await persistCurrentReceipt(finalReceipt);

    await persistReceipts(append(finalReceipt, receipts));
    setReceipts(append(finalReceipt));
  }, [
    currentReceipt,
    persistCurrentReceipt,
    persistReceipts,
    receipts,
    storage?.firstAvailableSerialNumber,
    storage?.yearCode,
    user?.company?.address,
    user?.company?.bankAccount,
    user?.company?.city,
    user?.company?.country,
    user?.company?.felir,
    user?.company?.iban,
    user?.company?.name,
    user?.company?.postalCode,
    user?.company?.vatNumber,
  ]);

  const sendInReceipts = useCallback(async () => {
    if (!isReceiptsSyncInProgress && receipts.some((r) => !r.isSent)) {
      setIsReceiptsSyncInProgress(true);

      const updateReceiptsResponse = await createReceiptsAPI(receipts);
      const updatedReceipts = receipts.map((receipt) => {
        const updatedReceipt = updateReceiptsResponse.find(
          (receiptResponse) =>
            receiptResponse.serialNumber === receipt.serialNumber &&
            receiptResponse.yearCode === receipt.yearCode
        );

        return {
          ...receipt,
          id: updatedReceipt?.id,
          isSent: receipt.isSent || !!updatedReceipt,
        };
      });
      await persistReceipts(updatedReceipts);
      setReceipts(updatedReceipts);

      setIsReceiptsSyncInProgress(false);
    }
  }, [createReceiptsAPI, isReceiptsSyncInProgress, persistReceipts, receipts]);

  const updateNumberOfPrintedCopies = useCallback(
    async (receiptId: number) => {
      if (receiptId === currentReceipt.id) {
        const updatedReceipt = assoc(
          'originalCopiesPrinted',
          (currentReceipt.originalCopiesPrinted ?? 0) + 1,
          currentReceipt
        );

        setCurrentReceipt(updatedReceipt);
        await persistCurrentReceipt(updatedReceipt);
      }

      let updatedReceipts = receipts.map((receipt) => {
        if (receipt.id !== receiptId) {
          return receipt;
        }

        return {
          ...receipt,
          originalCopiesPrinted: (receipt.originalCopiesPrinted ?? 0) + 1,
          shouldBeUpdated: true,
        };
      });

      setReceipts(updatedReceipts);
      await persistReceipts(updatedReceipts);

      const updateReceiptsResult = await updateReceiptsAPI(updatedReceipts);
      updatedReceipts = receipts.map((receipt) => {
        const updateReceiptResult = updateReceiptsResult.find(
          (result) => result.id === receipt.id
        );

        if (!updateReceiptResult) {
          return receipt;
        }

        return {
          ...receipt,
          shouldBeUpdated: false,
        };
      });

      setReceipts(updatedReceipts);
      await persistReceipts(updatedReceipts);
    },
    [
      currentReceipt,
      persistCurrentReceipt,
      persistReceipts,
      receipts,
      updateReceiptsAPI,
    ]
  );

  const receiptsContextValue = useMemo(
    () => ({
      isPending: isActiveRoundPending || isUserPending || isStoreDetailsPending,
      receipts,
      numberOfReceipts,
      currentReceipt,
      resetCurrentReceipt,
      setCurrentReceiptBuyer,
      setCurrentReceiptItems,
      setCurrentReceiptOtherItems,
      finalizeCurrentReceipt,
      sendInReceipts,
      updateNumberOfPrintedCopies,
    }),
    [
      currentReceipt,
      finalizeCurrentReceipt,
      isActiveRoundPending,
      isStoreDetailsPending,
      isUserPending,
      numberOfReceipts,
      receipts,
      resetCurrentReceipt,
      sendInReceipts,
      setCurrentReceiptBuyer,
      setCurrentReceiptItems,
      setCurrentReceiptOtherItems,
      updateNumberOfPrintedCopies,
    ]
  );

  return (
    <ReceiptsContext.Provider value={receiptsContextValue}>
      {children}
    </ReceiptsContext.Provider>
  );
}

export function useReceiptsContext() {
  const receiptsContext = useContext(ReceiptsContext);

  if (receiptsContext === undefined) {
    throw new Error('useReceiptsContext must be used within ReceiptsProvider.');
  }

  return receiptsContext;
}
