import { useCallback, useMemo } from 'react';
import { useOrdersContext } from '../OrdersProvider';
import { useReceiptsContext } from '../ReceiptsProvider';

export type UseSummary = {
  isPending: boolean;
  syncSellFlowWithApi: () => Promise<void>;
};

export default function useSummary(): UseSummary {
  const { isPending: isOrdersContextPending, sendInOrders } = useOrdersContext();
  const { isPending: isReceiptsContextPending, sendInReceipts } = useReceiptsContext();

  const syncSellFlowWithApi = useCallback(async () => {
    await sendInOrders();
    await sendInReceipts();
  }, [sendInOrders, sendInReceipts]);

  return useMemo(
    () => ({
      isPending: isOrdersContextPending || isReceiptsContextPending,
      syncSellFlowWithApi,
    }),
    [isOrdersContextPending, isReceiptsContextPending, syncSellFlowWithApi]
  );
}
