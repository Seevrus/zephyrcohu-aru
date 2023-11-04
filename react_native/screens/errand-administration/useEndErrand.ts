import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

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
  const { resetOrdersContext } = useOrdersContext();
  const { receipts, numberOfReceipts, resetReceiptsContext } =
    useReceiptsContext();
  const { resetSellFlowContext } = useSellFlowContext();
  const { storage, clearStorageFromContext } = useStorageContext();
  const queryClient = useQueryClient();

  const finishRound = useCallback(async () => {
    const lastSerialNumber =
      numberOfReceipts === 0
        ? storage.firstAvailableSerialNumber
        : receipts.reduce(
            (sn, { serialNumber: receiptSn }) =>
              receiptSn > sn ? receiptSn : sn,
            0
          ) + 1;

    await finishRoundAPI({
      roundId: activeRound?.id,
      lastSerialNumber,
      yearCode: storage?.yearCode,
    });

    await Promise.all([
      clearStorageFromContext(),
      resetOrdersContext(),
      resetReceiptsContext(),
      resetSellFlowContext(),
    ]);

    await queryClient.invalidateQueries({ queryKey: ['active-round'] });
    await queryClient.invalidateQueries({ queryKey: ['check-token'] });
    await queryClient.invalidateQueries({ queryKey: ['items'] });
    await queryClient.invalidateQueries({ queryKey: ['other-items'] });
    await queryClient.invalidateQueries({ queryKey: ['partner-lists'] });
    await queryClient.invalidateQueries({ queryKey: ['partners'] });
    await queryClient.invalidateQueries({ queryKey: ['price-lists'] });
    await queryClient.invalidateQueries({ queryKey: ['search-tax-number'] });
    await queryClient.invalidateQueries({ queryKey: ['store-details'] });
    await queryClient.invalidateQueries({ queryKey: ['stores'] });
  }, [
    activeRound?.id,
    clearStorageFromContext,
    finishRoundAPI,
    numberOfReceipts,
    queryClient,
    receipts,
    resetOrdersContext,
    resetReceiptsContext,
    resetSellFlowContext,
    storage?.firstAvailableSerialNumber,
    storage?.yearCode,
  ]);

  return useMemo(
    () => ({
      isPending: isActiveRoundPending,
      finishRound,
    }),
    [finishRound, isActiveRoundPending]
  );
}
