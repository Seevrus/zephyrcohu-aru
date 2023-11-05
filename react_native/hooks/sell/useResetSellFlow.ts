import { useAtom } from 'jotai';
import { useCallback } from 'react';

import { currentReceiptAtom } from '../../atoms/receipts';
import { selectedItemsAtom, selectedPartnerAtom } from '../../atoms/sellFlow';

export function useResetSellFlow() {
  const [, setCurrentReceipt] = useAtom(currentReceiptAtom);

  const [, setSelectedPartner] = useAtom(selectedPartnerAtom);
  const [, setSelectedItems] = useAtom(selectedItemsAtom);

  return useCallback(() => {
    setCurrentReceipt(null);

    setSelectedPartner(null);
    setSelectedItems({});
  }, [setCurrentReceipt, setSelectedPartner]);
}
