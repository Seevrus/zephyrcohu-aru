import { useNetInfo } from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

import { useCheckToken } from '../api/queries/useCheckToken';
import { useToken } from '../api/queries/useToken';
import { useOrdersContext } from '../providers/OrdersProvider';
import { useReceiptsContext } from '../providers/ReceiptsProvider';

export enum StorageTileState {
  Ok = 'ok',
  Neutral = 'neutral',
  Disabled = 'disabled',
}

export enum SelectPartnerTileState {
  Neutral = 'neutral',
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

export function useTileStates() {
  const { data: user, isPending: isUserFetching } = useCheckToken();
  const { isInternetReachable } = useNetInfo();
  const { numberOfOrders } = useOrdersContext();
  const { numberOfReceipts } = useReceiptsContext();
  const {
    isPending: isTokenPending,
    data: { isPasswordExpired, isTokenExpired } = {},
  } = useToken();

  const isCheckTokenInProgress = !user && isUserFetching;

  const isUserIdle = user?.state === 'I';
  const isStorageStarted = user?.state === 'L';
  const isRoundStarted = user?.state === 'R';

  const [storageTileState, setStorageTileState] = useState<StorageTileState>(
    StorageTileState.Disabled
  );
  const [storageTileMessage, setStorageTileMessage] = useState<string>('');

  const [selectPartnerTileState, setSelectPartnerTileState] =
    useState<SelectPartnerTileState>(SelectPartnerTileState.Disabled);
  const [selectPartnerTileMessage, setSelectPartnerTileMessage] =
    useState<string>('');

  const [receiptsTileState, setReceiptsTileState] = useState<ReceiptsTileState>(
    ReceiptsTileState.Disabled
  );
  const [receiptsTileMessage, setReceiptsTileMessage] = useState<string>('');

  const [startErrandTileState, setStartErrandTileState] =
    useState<StartErrandTileState>(StartErrandTileState.Disabled);
  const [startErrandTileMessage, setStartErrandTileMessage] =
    useState<string>('');

  const [endErrandTileState, setEndErrandTileState] =
    useState<EndErrandTileState>(EndErrandTileState.Disabled);
  const [endErrandTileMessage, setEndErrandTileMessage] = useState<string>('');

  useEffect(() => {
    enum DisabledTileMessage {
      LoggedOut = 'A funkció csak bejelentkezés után elérhető.',
      PasswordExpired = 'Az Ön jelszava lejárt, kérem változtassa meg.',
      Offline = 'A funkció csak online érhető el.',
    }

    if (!isTokenPending && !isCheckTokenInProgress) {
      if (isTokenExpired) {
        setStorageTileMessage(DisabledTileMessage.LoggedOut);
        setStartErrandTileMessage(DisabledTileMessage.LoggedOut);
        setEndErrandTileMessage(DisabledTileMessage.LoggedOut);
      } else if (isPasswordExpired) {
        setStorageTileMessage(DisabledTileMessage.PasswordExpired);
        setStartErrandTileMessage(DisabledTileMessage.PasswordExpired);
        setEndErrandTileMessage(DisabledTileMessage.PasswordExpired);
      } else if (!isInternetReachable) {
        setStorageTileMessage(DisabledTileMessage.Offline);
        setStartErrandTileMessage(DisabledTileMessage.Offline);
        setEndErrandTileMessage(DisabledTileMessage.Offline);
      }

      if (!user) {
        setSelectPartnerTileMessage(DisabledTileMessage.LoggedOut);
      }
    }
  }, [
    isCheckTokenInProgress,
    isInternetReachable,
    isPasswordExpired,
    isTokenExpired,
    isTokenPending,
    user,
  ]);

  useEffect(() => {
    if (!isTokenPending && !isCheckTokenInProgress) {
      if (
        !isTokenExpired &&
        !isPasswordExpired &&
        isInternetReachable &&
        isUserIdle
      ) {
        setStorageTileState(StorageTileState.Ok);
        setStorageTileMessage('');
      } else if (
        !isTokenExpired &&
        !isPasswordExpired &&
        isInternetReachable &&
        isStorageStarted
      ) {
        setStorageTileState(StorageTileState.Neutral);
        setStorageTileMessage('');
      } else {
        setStorageTileState(StorageTileState.Disabled);
        if (!isTokenExpired && !isPasswordExpired && isInternetReachable) {
          setStorageTileMessage('Rakodás csak a kör zárása után kezdhető meg.');
        } else if (isRoundStarted) {
          setStorageTileMessage(
            'Folyamatban lévő kör közben a rakodás nem elérhető.'
          );
        }
      }
    }
  }, [
    isCheckTokenInProgress,
    isInternetReachable,
    isPasswordExpired,
    isRoundStarted,
    isStorageStarted,
    isTokenExpired,
    isTokenPending,
    isUserIdle,
  ]);

  useEffect(() => {
    if (!isTokenPending && !isCheckTokenInProgress) {
      if (
        !isTokenExpired &&
        !isPasswordExpired &&
        isInternetReachable &&
        isUserIdle
      ) {
        setStartErrandTileState(StartErrandTileState.Ok);
        setEndErrandTileMessage('');
      } else if (
        !isTokenExpired &&
        !isPasswordExpired &&
        isInternetReachable &&
        isRoundStarted &&
        numberOfOrders === 0 &&
        numberOfReceipts === 0
      ) {
        setStartErrandTileState(StartErrandTileState.Warning);
        setStartErrandTileMessage('Biztosan szeretne új kört indítani?');
      } else {
        setStartErrandTileState(StartErrandTileState.Disabled);
        if (
          !isTokenExpired &&
          !isPasswordExpired &&
          isInternetReachable &&
          isStorageStarted
        ) {
          setStartErrandTileMessage('Rakodás közben kör nem indítható.');
        }
      }
    }
  }, [
    isCheckTokenInProgress,
    isInternetReachable,
    isPasswordExpired,
    isRoundStarted,
    isStorageStarted,
    isTokenExpired,
    isTokenPending,
    isUserIdle,
    numberOfOrders,
    numberOfReceipts,
  ]);

  useEffect(() => {
    if (!isTokenPending && !isCheckTokenInProgress) {
      if (isRoundStarted) {
        setSelectPartnerTileState(SelectPartnerTileState.Neutral);
        setSelectPartnerTileMessage('');
      } else {
        setSelectPartnerTileState(SelectPartnerTileState.Disabled);
        if (!isTokenExpired && !isPasswordExpired && isInternetReachable) {
          setSelectPartnerTileMessage(
            'A funkció csak körindítás után elérhető.'
          );
        }
      }
    }
  }, [
    isCheckTokenInProgress,
    isInternetReachable,
    isPasswordExpired,
    isRoundStarted,
    isTokenExpired,
    isTokenPending,
  ]);

  useEffect(() => {
    if (!isTokenPending && !isCheckTokenInProgress) {
      if (numberOfReceipts > 0) {
        setReceiptsTileState(ReceiptsTileState.Neutral);
        setReceiptsTileMessage('');
      } else {
        setReceiptsTileState(ReceiptsTileState.Disabled);
        setReceiptsTileMessage('Nincs elérhető bizonylat.');
      }
    }
  }, [
    isCheckTokenInProgress,
    isInternetReachable,
    isPasswordExpired,
    isTokenExpired,
    isTokenPending,
    numberOfReceipts,
  ]);

  useEffect(() => {
    if (!isTokenPending && !isCheckTokenInProgress) {
      if (
        !isTokenExpired &&
        !isPasswordExpired &&
        isInternetReachable &&
        isRoundStarted
      ) {
        setEndErrandTileState(EndErrandTileState.Warning);
        setEndErrandTileMessage('Biztosan szeretné zárni a kört?');
      } else {
        setEndErrandTileState(EndErrandTileState.Disabled);
        if (!isTokenExpired && !isPasswordExpired && isInternetReachable) {
          setEndErrandTileMessage('A funkció csak körindítás után elérhető.');
        }
      }
    }
  }, [
    isCheckTokenInProgress,
    isInternetReachable,
    isPasswordExpired,
    isRoundStarted,
    isTokenExpired,
    isTokenPending,
  ]);

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
