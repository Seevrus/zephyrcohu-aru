import { useAtom } from 'jotai';
import { useCallback } from 'react';

import { currentReceiptAtom } from '../../atoms/receipts';
import {
  maxNewPartnerIdInUseAtom,
  reviewItemsAtom,
  selectedItemsAtom,
  selectedOtherItemsAtom,
  selectedPartnerAtom,
} from '../../atoms/sellFlow';

export function useResetSellFlow() {
  const [, setCurrentReceipt] = useAtom(currentReceiptAtom);

  const [, setSelectedPartner] = useAtom(selectedPartnerAtom);
  const [, setSelectedItems] = useAtom(selectedItemsAtom);
  const [, setSelectedOtherItems] = useAtom(selectedOtherItemsAtom);
  const [, setReviewItems] = useAtom(reviewItemsAtom);
  const [, setMaxNewPartnerIdInUse] = useAtom(maxNewPartnerIdInUseAtom);

  return useCallback(async () => {
    await setCurrentReceipt(null);

    setSelectedPartner(null);
    setSelectedItems({});
    setSelectedOtherItems({});
    setReviewItems(null);
    await setMaxNewPartnerIdInUse(0);
  }, [
    setCurrentReceipt,
    setMaxNewPartnerIdInUse,
    setReviewItems,
    setSelectedItems,
    setSelectedOtherItems,
    setSelectedPartner,
  ]);
}
