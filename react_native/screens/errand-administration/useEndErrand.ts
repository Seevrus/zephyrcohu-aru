import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { last } from 'ramda';
import { useFinishRound } from '../../api/mutations/useFinishRound';
import { useActiveRound } from '../../api/queries/useActiveRound';
import { useOrdersContext } from '../../providers/OrdersProvider';
import { useReceiptsContext } from '../../providers/ReceiptsProvider';
import { useSellFlowContext } from '../../providers/SellFlowProvider';
import { useStorageContext } from '../../providers/StorageProvider';

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
  const queryClient = useQueryClient();

  const { serialNumber: lastSerialNumber, yearCode } = last(receipts);

  const finishRound = useCallback(async () => {
    await finishRoundAPI({
      roundId: activeRound?.id,
      lastSerialNumber,
      yearCode,
    });

    await Promise.all([
      clearStorageFromContext(),
      resetOrdersContext(),
      resetReceiptsContext(),
      resetSellFlowContext(),
    ]);

    queryClient.invalidateQueries({ queryKey: ['active-round'] });
    queryClient.invalidateQueries({ queryKey: ['check-token'] });
    queryClient.invalidateQueries({ queryKey: ['items'] });
    queryClient.invalidateQueries({ queryKey: ['other-items'] });
    queryClient.invalidateQueries({ queryKey: ['partner-lists'] });
    queryClient.invalidateQueries({ queryKey: ['partners'] });
    queryClient.invalidateQueries({ queryKey: ['price-lists'] });
    queryClient.invalidateQueries({ queryKey: ['search-tax-number'] });
    queryClient.invalidateQueries({ queryKey: ['store-details'] });
    queryClient.invalidateQueries({ queryKey: ['stores'] });
  }, [
    activeRound?.id,
    clearStorageFromContext,
    finishRoundAPI,
    lastSerialNumber,
    queryClient,
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
