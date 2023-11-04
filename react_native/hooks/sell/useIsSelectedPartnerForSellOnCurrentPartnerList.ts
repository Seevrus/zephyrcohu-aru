import { useAtomValue } from 'jotai';
import { useMemo } from 'react';

import { useActiveRound } from '../../api/queries/useActiveRound';
import { usePartnerLists } from '../../api/queries/usePartnerLists';
import { selectedPartnerAtom } from '../../atoms/sell-flow/partners';

export function useIsSelectedPartnerForSellOnCurrentPartnerList() {
  const { data: activeRound } = useActiveRound();
  const { data: partnerLists } = usePartnerLists();

  const selectedPartner = useAtomValue(selectedPartnerAtom);

  const currentPartnerList = useMemo(
    () =>
      partnerLists?.find(
        (partnerList) => partnerList.id === activeRound?.partnerListId
      ),
    [activeRound?.partnerListId, partnerLists]
  );

  return !currentPartnerList || !selectedPartner
    ? undefined
    : currentPartnerList?.partners?.includes(selectedPartner.id);
}
