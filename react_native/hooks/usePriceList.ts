import { useCallback } from 'react';
import { RootState } from '../store';
import { useAppSelector } from '../store/hooks';

const usePriceList = () => {
  const partnerId = useAppSelector((state) => state.round.currentReceipt?.partnerId);
  const selectPriceList = useCallback(
    (state: RootState) =>
      state.partners.partners.find((partner) => partner.id === partnerId)?.priceList || {},
    [partnerId]
  );

  return useAppSelector(selectPriceList);
};

export default usePriceList;
