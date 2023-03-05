import { useNetInfo } from '@react-native-community/netinfo';
import { isNil } from 'ramda';
import { useEffect, useState } from 'react';

import { useAppSelector } from '../store/hooks';

export enum SelectPartnerTile {
  Ok = 'ok',
  Disabled = 'disabled',
}

export enum ReceiptsTile {
  Neutral = 'neutral',
  Disabled = 'disabled',
}

export enum StartErrandTile {
  Ok = 'ok',
  Warning = 'warning',
  Disabled = 'disabled',
}

export enum EndErrandTile {
  Warning = 'warning',
  Disabled = 'disabled',
}

const useIndexTile = () => {
  const { isInternetReachable } = useNetInfo();

  const isRoundStarted = !isNil(useAppSelector((state) => state.round.storeId));
  const numberOfReceipts = useAppSelector((state) => state.round.receipts)?.length ?? 0;

  const [selectPartnerTile, setSelectPartnerTile] = useState<SelectPartnerTile>(
    SelectPartnerTile.Disabled
  );
  const [receiptsTile, setReceiptsTile] = useState<ReceiptsTile>(ReceiptsTile.Disabled);
  const [startErrandTile, setStartErrandTile] = useState<StartErrandTile>(StartErrandTile.Disabled);
  const [endErrandTile, setEndErrandTile] = useState<EndErrandTile>(EndErrandTile.Disabled);

  useEffect(() => {
    if (isRoundStarted) {
      setSelectPartnerTile(SelectPartnerTile.Ok);
    } else {
      setSelectPartnerTile(SelectPartnerTile.Disabled);
    }
  }, [isRoundStarted]);

  useEffect(() => {
    setReceiptsTile(ReceiptsTile.Disabled);
  }, []);

  useEffect(() => {
    if (isInternetReachable && !isRoundStarted) {
      setStartErrandTile(StartErrandTile.Ok);
    } else if (isInternetReachable && isRoundStarted && !numberOfReceipts) {
      setStartErrandTile(StartErrandTile.Warning);
    } else {
      setStartErrandTile(StartErrandTile.Disabled);
    }
  }, [isInternetReachable, isRoundStarted, numberOfReceipts]);

  useEffect(() => {
    if (isInternetReachable && isRoundStarted) {
      setEndErrandTile(EndErrandTile.Warning);
    } else {
      setEndErrandTile(EndErrandTile.Disabled);
    }
  }, [isInternetReachable, isRoundStarted]);

  return {
    selectPartnerTile,
    receiptsTile,
    startErrandTile,
    endErrandTile,
  };
};

export default useIndexTile;
