import { useNetInfo } from '@react-native-community/netinfo';
import { isNil } from 'ramda';
import { useEffect, useState } from 'react';

import useToken from '../api/queries/useToken';
import { useStorageContext } from '../providers/StorageProvider';
import { useUserContext } from '../providers/UserProvider';

export enum StorageTileState {
  Ok = 'ok',
  Neutral = 'neutral',
  Disabled = 'disabled',
}

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
  const { storage } = useStorageContext();
  const {
    data: { isPasswordExpired, isTokenExpired },
  } = useToken();
  const { user } = useUserContext();

  const isRoundStarted = storage?.state === 'R';
  const numberOfReceipts = 0;

  const [storageTileState, setStorageTileState] = useState<StorageTileState>(
    StorageTileState.Disabled
  );
  const [storageTileMessage, setStorageTileMessage] = useState<string>('');

  const [selectPartnerTileState, setSelectPartnerTileState] = useState<SelectPartnerTileState>(
    SelectPartnerTileState.Disabled
  );
  const [selectPartnerTileMessage, setSelectPartnerTileMessage] = useState<string>('');

  const [receiptsTileState, setReceiptsTileState] = useState<ReceiptsTileState>(
    ReceiptsTileState.Disabled
  );
  const [receiptsTileMessage, setReceiptsTileMessage] = useState<string>('');

  const [startErrandTileState, setStartErrandTileState] = useState<StartErrandTileState>(
    StartErrandTileState.Disabled
  );
  const [startErrandTileMessage, setStartErrandTileMessage] = useState<string>('');

  const [endErrandTileState, setEndErrandTileState] = useState<EndErrandTileState>(
    EndErrandTileState.Disabled
  );
  const [endErrandTileMessage, setEndErrandTileMessage] = useState<string>('');

  useEffect(() => {
    if (
      !isTokenExpired &&
      !isPasswordExpired &&
      isInternetReachable &&
      (isNil(user?.storeId) || storage?.state === 'I')
    ) {
      setStorageTileState(StorageTileState.Ok);
    } else if (
      !isTokenExpired &&
      !isPasswordExpired &&
      isInternetReachable &&
      storage?.state === 'L'
    ) {
      setStorageTileState(StorageTileState.Neutral);
    } else {
      setStorageTileState(StorageTileState.Disabled);
    }
  }, [isInternetReachable, isPasswordExpired, isTokenExpired, storage?.state, user?.storeId]);

  useEffect(() => {
    if (!isTokenExpired && !isPasswordExpired && isInternetReachable && !isRoundStarted) {
      setStartErrandTileState(StartErrandTileState.Ok);
    } else if (
      !isTokenExpired &&
      !isPasswordExpired &&
      isInternetReachable &&
      numberOfReceipts === 0
    ) {
      setStartErrandTileState(StartErrandTileState.Warning);
    } else {
      setStartErrandTileState(StartErrandTileState.Disabled);
    }
  }, [isInternetReachable, isPasswordExpired, isRoundStarted, isTokenExpired]);

  return {
    storageTileState,
    storageTileMessage,
    selectPartnerTileState,
    selectPartnerTileMessage,
    receiptsTileState,
    receiptsTileMessage,
    startErrandTileState,
    startErrandTileMessage,
    endErrandTileState,
    endErrandTileMessage,
  };
}
