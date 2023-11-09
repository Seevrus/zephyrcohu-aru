import { useAtomValue } from 'jotai';
import { useMemo } from 'react';

import { usePriceLists } from '../../api/queries/usePriceLists';
import { selectedPartnerAtom } from '../../atoms/sellFlow';

export function useCurrentPriceList() {
  const { data: priceLists } = usePriceLists();

  const selectedPartner = useAtomValue(selectedPartnerAtom);

  return useMemo(
    () =>
      priceLists?.find(
        (priceList) => priceList.id === selectedPartner?.priceList?.id
      ),
    [priceLists, selectedPartner?.priceList?.id]
  );
}
