import { useNetInfo } from '@react-native-community/netinfo';
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
  const { type: netWorkType } = useNetInfo();

  const isRoundStarted = !!useAppSelector((state) => state.round.id);
  const numberOfReceipts = useAppSelector((state) => state.round.receipts).length;

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
    if (numberOfReceipts) {
      setReceiptsTile(ReceiptsTile.Neutral);
    } else {
      setReceiptsTile(ReceiptsTile.Disabled);
    }
  }, [numberOfReceipts]);

  useEffect(() => {
    if (netWorkType === 'wifi' && !isRoundStarted) {
      setStartErrandTile(StartErrandTile.Ok);
    } else if (netWorkType === 'wifi' && isRoundStarted && !numberOfReceipts) {
      setStartErrandTile(StartErrandTile.Warning);
    } else {
      setStartErrandTile(StartErrandTile.Disabled);
    }
  }, [isRoundStarted, netWorkType, numberOfReceipts]);

  useEffect(() => {
    if (isRoundStarted) {
      setEndErrandTile(EndErrandTile.Warning);
    } else {
      setEndErrandTile(EndErrandTile.Disabled);
    }
  }, [isRoundStarted]);

  return {
    selectPartnerTile,
    receiptsTile,
    startErrandTile,
    endErrandTile,
  };
};

export default useIndexTile;
