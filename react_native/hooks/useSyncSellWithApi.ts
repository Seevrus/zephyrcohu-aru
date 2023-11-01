import { useNetInfo } from '@react-native-community/netinfo';
import { isEmpty, not } from 'ramda';
import { useEffect, useState } from 'react';

import { useOrdersContext } from '../providers/OrdersProvider';
import { useReceiptsContext } from '../providers/ReceiptsProvider';

export function useSyncSellWithApi() {
  const { isInternetReachable } = useNetInfo();
  const { isPending: isOrdersContextPending, sendInOrders } =
    useOrdersContext();
  const { isPending: isReceiptsContextPending, sendInReceipts } =
    useReceiptsContext();

  const [ordersSuccess, setOrdersSuccess] = useState<string>('');
  const [ordersError, setOrdersError] = useState<string>('');
  const [receiptsSuccess, setReceiptsSuccess] = useState<string>('');
  const [receiptsError, setReceiptsError] = useState<string>('');

  useEffect(() => {
    if (
      isInternetReachable === true &&
      !isOrdersContextPending &&
      !isReceiptsContextPending &&
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
    isOrdersContextPending,
    isReceiptsContextPending,
    ordersError,
    ordersSuccess,
    receiptsError,
    receiptsSuccess,
    sendInOrders,
    sendInReceipts,
  ]);

  return {
    isPending: isOrdersContextPending || isReceiptsContextPending,
    ordersError,
    ordersSuccess,
    receiptsError,
    receiptsSuccess,
  };
}
