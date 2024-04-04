import { useAtomValue } from 'jotai';
import { useMemo } from 'react';

import { useCheckToken } from '../../api/queries/useCheckToken';
import { usePartnerLists } from '../../api/queries/usePartnerLists';
import { selectedPartnerAtom } from '../../atoms/sellFlow';

export function useIsSelectedPartnerForSellOnCurrentPartnerList() {
  const { data: user } = useCheckToken();
  const { data: partnerLists } = usePartnerLists();

  const selectedPartner = useAtomValue(selectedPartnerAtom);

  const currentPartnerList = useMemo(
    () =>
      partnerLists?.find(
        (partnerList) => partnerList.id === user?.round?.partnerListId
      ),
    [partnerLists, user?.round?.partnerListId]
  );

  return !currentPartnerList || !selectedPartner
    ? undefined
    : currentPartnerList?.partners?.includes(selectedPartner.id);
}
