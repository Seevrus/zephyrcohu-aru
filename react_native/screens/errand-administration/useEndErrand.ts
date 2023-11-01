import { useCallback, useMemo } from 'react';

import { last } from 'ramda';
import { useFinishRound } from '../../api/mutations/useFinishRound';
import { useActiveRound } from '../../api/queries/useActiveRound';
import { useOrdersContext } from '../../providers/OrdersProvider';
import { useReceiptsContext } from '../../providers/ReceiptsProvider';
import { useStorageContext } from '../../providers/StorageProvider';
import { useSellFlowContext } from '../../providers/SellFlowProvider';

export function useEndErrand() {
  const { isPending: isActiveRoundPending, data: activeRound } =
    useActiveRound();
  const { mutateAsync: finishRoundAPI } = useFinishRound();
  const { isPending: isOrdersContextPending, resetOrdersContext } =
    useOrdersContext();
  const {
    isPending: isReceiptsContextPending,
    receipts,
    resetReceiptsContext,
  } = useReceiptsContext();
  const { isPending: isSellFlowContextPending, resetSellFlowContext } =
    useSellFlowContext();
  const { isPending: isStorageContextPending, clearStorageFromContext } =
    useStorageContext();

  const { serialNumber: lastSerialNumber, yearCode } = last(receipts);

  const finishRound = useCallback(async () => {
    await finishRoundAPI({
      roundId: activeRound?.id,
      lastSerialNumber,
      yearCode,
    });

    return Promise.all([
      clearStorageFromContext(),
      resetOrdersContext(),
      resetReceiptsContext(),
      resetSellFlowContext(),
    ]);
  }, [
    activeRound?.id,
    clearStorageFromContext,
    finishRoundAPI,
    lastSerialNumber,
    resetOrdersContext,
    resetReceiptsContext,
    resetSellFlowContext,
    yearCode,
  ]);

  return useMemo(
    () => ({
      isPending:
        isActiveRoundPending ||
        isOrdersContextPending ||
        isReceiptsContextPending ||
        isSellFlowContextPending ||
        isStorageContextPending,
      finishRound,
    }),
    [
      finishRound,
      isActiveRoundPending,
      isOrdersContextPending,
      isReceiptsContextPending,
      isSellFlowContextPending,
      isStorageContextPending,
    ]
  );
}
