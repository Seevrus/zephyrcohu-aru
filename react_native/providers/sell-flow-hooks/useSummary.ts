import { useCallback, useMemo } from 'react';
import { useOrdersContext } from '../OrdersProvider';
import { useReceiptsContext } from '../ReceiptsProvider';

export type UseSummary = {
  isPending: boolean;
  syncSellFlowWithApi: () => Promise<
    [PromiseSettledResult<void>, PromiseSettledResult<void>]
  >;
};

export function useSummary(): UseSummary {
  const { isPending: isOrdersContextPending, sendInOrders } =
    useOrdersContext();
  const { isPending: isReceiptsContextPending, sendInReceipts } =
    useReceiptsContext();

  const syncSellFlowWithApi = useCallback(
    () => Promise.allSettled([sendInOrders(), sendInReceipts()]),
    [sendInOrders, sendInReceipts]
  );

  return useMemo(
    () => ({
      isPending: isOrdersContextPending || isReceiptsContextPending,
      syncSellFlowWithApi,
    }),
    [isOrdersContextPending, isReceiptsContextPending, syncSellFlowWithApi]
  );
}
