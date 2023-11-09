import { useNetInfo } from '@react-native-community/netinfo';
import { useIsFocused } from '@react-navigation/native';
import { useAtomValue } from 'jotai';
import { loadable } from 'jotai/utils';

import { useCheckToken } from '../api/queries/useCheckToken';
import { numberOfReceiptsAtom } from '../atoms/receipts';
import { tokenAtom } from '../atoms/token';
import { useMemo } from 'react';

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
  const loadableNumberOfReceipts = useAtomValue(loadable(numberOfReceiptsAtom));
  const tokenData = useAtomValue(loadable(tokenAtom));

  const tokenHasData = tokenData.state === 'hasData';

  const isCheckTokenInProgress = !user && isUserFetching;
  const numberOfReceipts =
    loadableNumberOfReceipts.state === 'hasData'
      ? loadableNumberOfReceipts.data
      : 0;

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

    if (tokenHasData && isFocused && !isCheckTokenInProgress) {
      if (tokenData.data.isTokenExpired) {
        message = DisabledTileMessage.LoggedOut;
      } else if (tokenData.data.isPasswordExpired) {
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
    isRoundStarted,
    isStorageStarted,
    isUserIdle,
    tokenData,
    tokenHasData,
  ]);

  const [startErrandTileState, startErrandTileMessage] = useMemo(() => {
    let state = StartErrandTileState.Disabled;
    let message = '';

    if (tokenHasData && isFocused && !isCheckTokenInProgress) {
      if (tokenData.data.isTokenExpired) {
        message = DisabledTileMessage.LoggedOut;
      } else if (tokenData.data.isPasswordExpired) {
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
    isRoundStarted,
    isStorageStarted,
    isUserIdle,
    tokenData,
    tokenHasData,
  ]);

  const [selectPartnerTileState, selectPartnerTileMessage] = (() => {
    let state = SelectPartnerTileState.Disabled;
    let message = '';

    if (isFocused && !isCheckTokenInProgress) {
      if (isRoundStarted) {
        state = SelectPartnerTileState.Neutral;
      } else {
        message = 'A funkció csak körindítás után elérhető.';
      }
    }

    return [state, message];
  })();

  const [receiptsTileState, receiptsTileMessage] = (() => {
    let state = ReceiptsTileState.Disabled;
    let message = '';

    if (isFocused && !isCheckTokenInProgress) {
      if (numberOfReceipts > 0) {
        state = ReceiptsTileState.Neutral;
      } else {
        message = 'Nincs elérhető bizonylat.';
      }
    }

    return [state, message];
  })();

  const [endErrandTileState, endErrandTileMessage] = (() => {
    let state = EndErrandTileState.Disabled;
    let message = '';

    if (tokenHasData && isFocused && !isCheckTokenInProgress) {
      if (tokenData.data.isTokenExpired) {
        message = DisabledTileMessage.LoggedOut;
      } else if (tokenData.data.isPasswordExpired) {
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
  })();

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
