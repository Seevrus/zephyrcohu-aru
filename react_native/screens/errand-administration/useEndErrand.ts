import { useAtomValue } from 'jotai';
import { useCallback, useMemo } from 'react';

import { useFinishRound } from '../../api/mutations/useFinishRound';
import { useCheckToken } from '../../api/queries/useCheckToken';
import { numberOfReceiptsAtom, receiptsAtom } from '../../atoms/receipts';
import { selectedStoreCurrentStateAtom } from '../../atoms/storage';

export function useEndErrand() {
  const { isPending: isUserPending, data: user } = useCheckToken();
  const { mutateAsync: finishRoundAPI } = useFinishRound();

  const numberOfReceipts = useAtomValue(numberOfReceiptsAtom);
  const receipts = useAtomValue(receiptsAtom);
  const selectedStoreCurrentState = useAtomValue(selectedStoreCurrentStateAtom);

  const finishRound = useCallback(async () => {
    if (user?.lastRound) {
      const lastSerialNumber =
        numberOfReceipts === 0
          ? selectedStoreCurrentState?.firstAvailableSerialNumber
          : receipts.reduce(
              (sn, { serialNumber: receiptSn }) =>
                receiptSn > sn ? receiptSn : sn,
              0
            ) + 1;

      await finishRoundAPI({
        roundId: user.lastRound?.id,
        lastSerialNumber,
        yearCode: selectedStoreCurrentState?.yearCode,
      });
    }
  }, [
    finishRoundAPI,
    numberOfReceipts,
    receipts,
    selectedStoreCurrentState?.firstAvailableSerialNumber,
    selectedStoreCurrentState?.yearCode,
    user?.lastRound,
  ]);

  return useMemo(
    () => ({
      isPending: isUserPending,
      finishRound,
    }),
    [finishRound, isUserPending]
  );
}
