import { useAtomValue } from 'jotai';
import { useCallback, useMemo } from 'react';

import { useFinishRound } from '../../api/mutations/useFinishRound';
import { useActiveRound } from '../../api/queries/useActiveRound';
import { numberOfReceiptsAtom, receiptsAtom } from '../../atoms/receipts';
import { selectedStoreCurrentStateAtom } from '../../atoms/storage';

export function useEndErrand() {
  const { isPending: isActiveRoundPending, data: activeRound } =
    useActiveRound();
  const { mutateAsync: finishRoundAPI } = useFinishRound();

  const numberOfReceipts = useAtomValue(numberOfReceiptsAtom);
  const receipts = useAtomValue(receiptsAtom);
  const selectedStoreCurrentState = useAtomValue(selectedStoreCurrentStateAtom);

  const finishRound = useCallback(async () => {
    if (activeRound) {
      const lastSerialNumber =
        numberOfReceipts === 0
          ? selectedStoreCurrentState?.firstAvailableSerialNumber
          : receipts.reduce(
              (sn, { serialNumber: receiptSn }) =>
                receiptSn > sn ? receiptSn : sn,
              0
            ) + 1;

      await finishRoundAPI({
        roundId: activeRound?.id,
        lastSerialNumber,
        yearCode: selectedStoreCurrentState?.yearCode,
      });
    }
  }, [
    activeRound,
    finishRoundAPI,
    numberOfReceipts,
    receipts,
    selectedStoreCurrentState?.firstAvailableSerialNumber,
    selectedStoreCurrentState?.yearCode,
  ]);

  return useMemo(
    () => ({
      isPending: isActiveRoundPending,
      finishRound,
    }),
    [finishRound, isActiveRoundPending]
  );
}
