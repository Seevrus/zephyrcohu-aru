import { useNetInfo } from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import useToken from '../api/queries/useToken';

export enum SelectPartnerTileState {
  Ok = 'ok',
  Disabled = 'disabled',
}

export enum ReceiptsTileState {
  Neutral = 'neutral',
  Disabled = 'disabled',
}

export enum StartErrandTileState {
  Ok = 'ok',
  Warning = 'warning',
  Disabled = 'disabled',
}

export enum EndErrandTileState {
  Warning = 'warning',
  Disabled = 'disabled',
}

export default function useTileStates() {
  const { isInternetReachable } = useNetInfo();
  const {
    data: { isTokenExpired },
  } = useToken();

  const isRoundStarted = false;
  const numberOfReceipts = 0;

  const [selectPartnerTileState, setSelectPartnerTileState] = useState<SelectPartnerTileState>(
    SelectPartnerTileState.Disabled
  );
  const [receiptsTileState, setReceiptsTileState] = useState<ReceiptsTileState>(
    ReceiptsTileState.Disabled
  );
  const [startErrandTileState, setStartErrandTileState] = useState<StartErrandTileState>(
    StartErrandTileState.Disabled
  );
  const [endErrandTileState, setEndErrandTileState] = useState<EndErrandTileState>(
    EndErrandTileState.Disabled
  );

  useEffect(() => {
    if (!isTokenExpired && isInternetReachable && !isRoundStarted) {
      setStartErrandTileState(StartErrandTileState.Ok);
    } else if (!isTokenExpired && isInternetReachable && numberOfReceipts === 0) {
      setStartErrandTileState(StartErrandTileState.Warning);
    } else {
      setStartErrandTileState(StartErrandTileState.Disabled);
    }
  }, [isInternetReachable, isRoundStarted, isTokenExpired]);

  return {
    selectPartnerTileState,
    receiptsTileState,
    startErrandTileState,
    endErrandTileState,
  };
}
