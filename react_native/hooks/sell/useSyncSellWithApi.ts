import { useNetInfo } from '@react-native-community/netinfo';
import { useAtom } from 'jotai';
import { assoc, isEmpty, not } from 'ramda';
import { useCallback, useEffect, useState } from 'react';

import { useCreateOrders } from '../../api/mutations/useCreateOrders';
import { useCreateReceipts } from '../../api/mutations/useCreateReceipts';
import { ordersAtom, type ContextOrder } from '../../atoms/orders';
import { receiptsAtom } from '../../atoms/receipts';

export function useSyncSellWithApi() {
  const { isInternetReachable } = useNetInfo();
  /* const { isPending: isOrdersContextPending, sendInOrders } =
    useOrdersContext();
  const { isPending: isReceiptsContextPending, sendInReceipts } =
    useReceiptsContext(); */

  const { isPending: isCreateOrdersPending, mutateAsync: createOrdersAPI } =
    useCreateOrders();
  const { isPending: isCreateReceiptsPending, mutateAsync: createReceiptsAPI } =
    useCreateReceipts();

  const [orders, setOrders] = useAtom(ordersAtom);
  const [receipts, setReceipts] = useAtom(receiptsAtom);

  const [isOrdersSyncInProgress, setIsOrdersSyncInProgress] = useState<boolean>(
    isCreateOrdersPending
  );
  const [isReceiptsSyncInProgress, setIsReceiptsSyncInProgress] =
    useState<boolean>(isCreateReceiptsPending);
  const [ordersSuccess, setOrdersSuccess] = useState<string>('');
  const [ordersError, setOrdersError] = useState<string>('');
  const [receiptsSuccess, setReceiptsSuccess] = useState<string>('');
  const [receiptsError, setReceiptsError] = useState<string>('');

  const sendInOrders = useCallback(async () => {
    if (!isOrdersSyncInProgress && orders.some((o) => !o.isSent)) {
      setIsOrdersSyncInProgress(true);

      const ordersApiResult = await createOrdersAPI(orders);
      const updatedOrders = orders.map<ContextOrder>(assoc('isSent', true));
      setOrders(updatedOrders);

      setIsOrdersSyncInProgress(false);
      return ordersApiResult;
    }
  }, [createOrdersAPI, isOrdersSyncInProgress, orders, setOrders]);

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
          id: updatedReceipt?.id ?? receipt.id,
          isSent: receipt.isSent || !!updatedReceipt,
        };
      });
      setReceipts(updatedReceipts);

      setIsReceiptsSyncInProgress(false);
      return updateReceiptsResponse;
    }
  }, [createReceiptsAPI, isReceiptsSyncInProgress, receipts, setReceipts]);

  useEffect(() => {
    if (
      isInternetReachable === true &&
      !isOrdersSyncInProgress &&
      !isReceiptsSyncInProgress &&
      !ordersSuccess &&
      !ordersError &&
      !receiptsSuccess &&
      !receiptsError
    ) {
      Promise.allSettled([sendInOrders(), sendInReceipts()]).then(
        ([ordersResult, receiptsResult]) => {
          if (
            ordersResult.status === 'fulfilled' &&
            not(isEmpty(ordersResult.value))
          ) {
            setOrdersSuccess('Rendelések beküldése sikeres.');
            setOrdersError('');
          } else {
            setOrdersSuccess('');
            setOrdersError('Rendelések beküldése sikertelen.');
          }

          if (receiptsResult.status === 'fulfilled') {
            setReceiptsSuccess('Sikeres számlaküldés.');
            setReceiptsError('');
          } else {
            setReceiptsSuccess('');
            setReceiptsError('Számlák beküldése sikertelen');
          }
        }
      );
    }
  }, [
    isInternetReachable,
    isOrdersSyncInProgress,
    isReceiptsSyncInProgress,
    ordersError,
    ordersSuccess,
    receiptsError,
    receiptsSuccess,
    sendInOrders,
    sendInReceipts,
  ]);

  return {
    isPending: isOrdersSyncInProgress || isReceiptsSyncInProgress,
    ordersError,
    ordersSuccess,
    receiptsError,
    receiptsSuccess,
  };
}
