import { useNetInfo } from '@react-native-community/netinfo';
import { useIsFocused } from '@react-navigation/native';
import { useMemo } from 'react';

import { useCheckToken } from '../api/queries/useCheckToken';
import { useToken } from '../api/queries/useToken';
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
  Disabled = 'disabled',
}

export enum EndErrandTileState {
  Warning = 'warning',
  Disabled = 'disabled',
}

export function useTileStates() {
  const { data: user, isPending: isUserFetching } = useCheckToken();
  const isFocused = useIsFocused();
  const { isInternetReachable } = useNetInfo();
  const { numberOfReceipts } = useReceiptsContext();
  const {
    isPending: isTokenPending,
    data: { isPasswordExpired, isTokenExpired } = {},
  } = useToken();

  const isCheckTokenInProgress = !user && isUserFetching;

  const isUserIdle = user?.state === 'I';
  const isStorageStarted = user?.state === 'L';
  const isRoundStarted = user?.state === 'R';

  enum DisabledTileMessage {
    LoggedOut = 'A funkció csak bejelentkezés után elérhető.',
    PasswordExpired = 'Az Ön jelszava lejárt, kérem változtassa meg.',
    Offline = 'A funkció csak online érhető el.',
  }

  const [storageTileState, storageTileMessage] = useMemo(() => {
    let state = StorageTileState.Disabled;
    let message = '';

    if (isFocused && !isTokenPending && !isCheckTokenInProgress) {
      if (isTokenExpired) {
        message = DisabledTileMessage.LoggedOut;
      } else if (isPasswordExpired) {
        message = DisabledTileMessage.PasswordExpired;
      } else if (!isInternetReachable) {
        message = DisabledTileMessage.Offline;
      } else if (isUserIdle) {
        state = StorageTileState.Ok;
      } else if (isStorageStarted) {
        state = StorageTileState.Neutral;
      } else if (isRoundStarted) {
        message = 'Folyamatban lévő kör közben a rakodás nem elérhető.';
      }
    }

    return [state, message];
  }, [
    DisabledTileMessage.LoggedOut,
    DisabledTileMessage.Offline,
    DisabledTileMessage.PasswordExpired,
    isCheckTokenInProgress,
    isFocused,
    isInternetReachable,
    isPasswordExpired,
    isRoundStarted,
    isStorageStarted,
    isTokenExpired,
    isTokenPending,
    isUserIdle,
  ]);

  const [startErrandTileState, startErrandTileMessage] = useMemo(() => {
    let state = StartErrandTileState.Disabled;
    let message = '';

    if (isFocused && !isTokenPending && !isCheckTokenInProgress) {
      if (isTokenExpired) {
        message = DisabledTileMessage.LoggedOut;
      } else if (isPasswordExpired) {
        message = DisabledTileMessage.PasswordExpired;
      } else if (!isInternetReachable) {
        message = DisabledTileMessage.Offline;
      } else if (isUserIdle) {
        state = StartErrandTileState.Ok;
      } else if (isStorageStarted) {
        message = 'Rakodás közben kör nem indítható.';
      } else if (isRoundStarted) {
        message = 'Körindítás előtt szükséges a megkezdett kör zárása.';
      }
    }

    return [state, message];
  }, [
    DisabledTileMessage.LoggedOut,
    DisabledTileMessage.Offline,
    DisabledTileMessage.PasswordExpired,
    isCheckTokenInProgress,
    isFocused,
    isInternetReachable,
    isPasswordExpired,
    isRoundStarted,
    isStorageStarted,
    isTokenExpired,
    isTokenPending,
    isUserIdle,
  ]);

  const [selectPartnerTileState, selectPartnerTileMessage] = useMemo(() => {
    let state = SelectPartnerTileState.Disabled;
    let message = '';

    if (isFocused && !isTokenPending && !isCheckTokenInProgress) {
      if (isRoundStarted) {
        state = SelectPartnerTileState.Neutral;
      } else {
        message = 'A funkció csak körindítás után elérhető.';
      }
    }

    return [state, message];
  }, [isCheckTokenInProgress, isFocused, isRoundStarted, isTokenPending]);

  const [receiptsTileState, receiptsTileMessage] = useMemo(() => {
    let state = ReceiptsTileState.Disabled;
    let message = '';

    if (isFocused && !isTokenPending && !isCheckTokenInProgress) {
      if (numberOfReceipts > 0) {
        state = ReceiptsTileState.Neutral;
      } else {
        message = 'Nincs elérhető bizonylat.';
      }
    }

    return [state, message];
  }, [isCheckTokenInProgress, isFocused, isTokenPending, numberOfReceipts]);

  const [endErrandTileState, endErrandTileMessage] = useMemo(() => {
    let state = EndErrandTileState.Disabled;
    let message = '';

    if (isFocused && !isTokenPending && !isCheckTokenInProgress) {
      if (isTokenExpired) {
        message = DisabledTileMessage.LoggedOut;
      } else if (isPasswordExpired) {
        message = DisabledTileMessage.PasswordExpired;
      } else if (!isInternetReachable) {
        message = DisabledTileMessage.Offline;
      } else if (isRoundStarted) {
        state = EndErrandTileState.Warning;
        message = 'Biztosan szeretné zárni a kört?';
      } else {
        message = 'A funkció csak körindítás után elérhető.';
      }
    }

    return [state, message];
  }, [
    DisabledTileMessage.LoggedOut,
    DisabledTileMessage.Offline,
    DisabledTileMessage.PasswordExpired,
    isCheckTokenInProgress,
    isFocused,
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
