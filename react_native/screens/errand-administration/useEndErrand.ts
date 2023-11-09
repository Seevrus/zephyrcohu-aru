import { useAtom, useAtomValue } from 'jotai';
import { useCallback, useMemo } from 'react';

import { useFinishRound } from '../../api/mutations/useFinishRound';
import { useActiveRound } from '../../api/queries/useActiveRound';
import { queryClient } from '../../api/queryClient';
import { currentOrderAtom, ordersAtom } from '../../atoms/orders';
import {
  currentReceiptAtom,
  numberOfReceiptsAtom,
  receiptsAtom,
} from '../../atoms/receipts';
import { selectedStoreAtom } from '../../atoms/storage';
import { useResetSellFlow } from '../../hooks/sell/useResetSellFlow';

export function useEndErrand() {
  const { isPending: isActiveRoundPending, data: activeRound } =
    useActiveRound();
  const { mutateAsync: finishRoundAPI } = useFinishRound();

  const resetSellFlow = useResetSellFlow();

  const [, setCurrentOrder] = useAtom(currentOrderAtom);
  const [, setCurrentReceipt] = useAtom(currentReceiptAtom);
  const numberOfReceipts = useAtomValue(numberOfReceiptsAtom);
  const [, setOrders] = useAtom(ordersAtom);
  const [receipts, setReceipts] = useAtom(receiptsAtom);
  const [selectedStoreCurrentState, setSelectedStoreCurrentState] =
    useAtom(selectedStoreAtom);

  const finishRound = useCallback(async () => {
    if (!!activeRound && !!selectedStoreCurrentState) {
      const lastSerialNumber =
        numberOfReceipts === 0
          ? selectedStoreCurrentState.firstAvailableSerialNumber
          : receipts.reduce(
              (sn, { serialNumber: receiptSn }) =>
                receiptSn > sn ? receiptSn : sn,
              0
            ) + 1;

      await finishRoundAPI({
        roundId: activeRound?.id,
        lastSerialNumber,
        yearCode: selectedStoreCurrentState.yearCode,
      });

      await setSelectedStoreCurrentState(null);
      await resetSellFlow();
      await setReceipts([]);
      await setCurrentReceipt(null);
      await setOrders([]);
      await setCurrentOrder(null);

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
    }
  }, [
    activeRound,
    finishRoundAPI,
    numberOfReceipts,
    receipts,
    resetSellFlow,
    selectedStoreCurrentState,
    setCurrentOrder,
    setCurrentReceipt,
    setOrders,
    setReceipts,
    setSelectedStoreCurrentState,
  ]);

  return useMemo(
    () => ({
      isPending: isActiveRoundPending,
      finishRound,
    }),
    [finishRound, isActiveRoundPending]
  );
}
