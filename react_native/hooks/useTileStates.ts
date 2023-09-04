import { useNetInfo } from '@react-native-community/netinfo';
import { isNil } from 'ramda';
import { useLayoutEffect, useState } from 'react';

import useCheckToken from '../api/queries/useCheckToken';
import useToken from '../api/queries/useToken';
import { useOrdersContext } from '../providers/OrdersProvider';
import { useReceiptsContext } from '../providers/ReceiptsProvider';
import { useStorageContext } from '../providers/StorageProvider';

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
  Neutral = 'neutral',
  Warning = 'warning',
  Disabled = 'disabled',
}

export enum EndErrandTileState {
  Warning = 'warning',
  Disabled = 'disabled',
}

export default function useTileStates() {
  const { data: user } = useCheckToken();
  const { isInternetReachable } = useNetInfo();
  const { numberOfOrders } = useOrdersContext();
  const { numberOfReceipts } = useReceiptsContext();
  const { storage } = useStorageContext();
  const {
    isLoading: isTokenLoading,
    data: { isPasswordExpired, isTokenExpired },
  } = useToken();

  const isRoundStarted = storage?.state === 'R';

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

  useLayoutEffect(() => {
    enum DisabledTileMessage {
      LoggedOut = 'A funkció csak bejelentkezés után elérhető.',
      PasswordExpired = 'Az Ön jelszava lejárt, kérem változtassa meg.',
      Offline = 'A funkció csak online érhető el.',
    }

    if (!isTokenLoading) {
      if (isTokenExpired) {
        setStorageTileMessage(DisabledTileMessage.LoggedOut);
        setStartErrandTileMessage(DisabledTileMessage.LoggedOut);
      } else if (isPasswordExpired) {
        setStorageTileMessage(DisabledTileMessage.PasswordExpired);
        setStartErrandTileMessage(DisabledTileMessage.PasswordExpired);
      } else if (!isInternetReachable) {
        setStorageTileMessage(DisabledTileMessage.Offline);
        setStartErrandTileMessage(DisabledTileMessage.Offline);
      }
    }
  }, [isInternetReachable, isPasswordExpired, isTokenExpired, isTokenLoading]);

  useLayoutEffect(() => {
    if (!isTokenLoading) {
      if (
        !isTokenExpired &&
        !isPasswordExpired &&
        isInternetReachable &&
        (isNil(user?.storeId) || storage?.state === 'I')
      ) {
        setStorageTileState(StorageTileState.Ok);
        setStorageTileMessage('');
      } else if (
        !isTokenExpired &&
        !isPasswordExpired &&
        isInternetReachable &&
        storage?.state === 'L'
      ) {
        setStorageTileState(StorageTileState.Neutral);
        setStorageTileMessage('');
      } else {
        setStorageTileState(StorageTileState.Disabled);
        if (!isTokenExpired && !isPasswordExpired && isInternetReachable) {
          setStorageTileMessage('Rakodás csak a kör zárása után kezdhető meg.');
        }
      }
    }
  }, [
    isInternetReachable,
    isPasswordExpired,
    isTokenExpired,
    isTokenLoading,
    storage?.state,
    user?.storeId,
  ]);

  useLayoutEffect(() => {
    if (!isTokenLoading) {
      if (!isTokenExpired && !isPasswordExpired && isInternetReachable && !isRoundStarted) {
        setStartErrandTileState(StartErrandTileState.Neutral);
        setEndErrandTileMessage('');
      } else if (
        !isTokenExpired &&
        !isPasswordExpired &&
        isInternetReachable &&
        numberOfOrders === 0 &&
        numberOfReceipts === 0
      ) {
        setStartErrandTileState(StartErrandTileState.Warning);
        setStartErrandTileMessage('Biztosan szeretne új kört indítani?');
      } else {
        setStartErrandTileState(StartErrandTileState.Disabled);
      }
    }
  }, [
    isInternetReachable,
    isPasswordExpired,
    isRoundStarted,
    isTokenExpired,
    isTokenLoading,
    numberOfOrders,
    numberOfReceipts,
  ]);

  useLayoutEffect(() => {
    if (!isTokenLoading) {
      if (isRoundStarted) {
        setSelectPartnerTileState(SelectPartnerTileState.Neutral);
        setSelectPartnerTileMessage('');
      } else {
        setSelectPartnerTileState(SelectPartnerTileState.Disabled);
        if (!isTokenExpired && !isPasswordExpired && isInternetReachable) {
          setSelectPartnerTileMessage('A funkció csak körindítás után elérhető.');
        }
      }
    }
  }, [isInternetReachable, isPasswordExpired, isRoundStarted, isTokenExpired, isTokenLoading]);

  useLayoutEffect(() => {
    if (!isTokenLoading) {
      if (numberOfReceipts > 0) {
        setReceiptsTileState(ReceiptsTileState.Neutral);
        setReceiptsTileMessage('');
      } else {
        setReceiptsTileState(ReceiptsTileState.Disabled);
        if (!isTokenExpired && !isPasswordExpired && isInternetReachable) {
          setReceiptsTileMessage('Nincs elérhető bizonylat.');
        }
      }
    }
  }, [isInternetReachable, isPasswordExpired, isTokenExpired, isTokenLoading, numberOfReceipts]);

  useLayoutEffect(() => {
    if (!isTokenLoading) {
      if (!isTokenExpired && !isPasswordExpired && isInternetReachable && isRoundStarted) {
        setEndErrandTileState(EndErrandTileState.Warning);
        setEndErrandTileMessage('Biztosan szeretné zárni a kört?');
      } else {
        setEndErrandTileState(EndErrandTileState.Disabled);
        if (!isTokenExpired && !isPasswordExpired && isInternetReachable) {
          setEndErrandTileMessage('A funkció csak körindítás után elérhető.');
        }
      }
    }
  }, [isInternetReachable, isPasswordExpired, isRoundStarted, isTokenExpired, isTokenLoading]);

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
