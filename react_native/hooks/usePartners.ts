import { filter, pipe, sort } from 'ramda';
import { useCallback } from 'react';

import { RootState } from '../store';
import { PartnerDetails } from '../store/partners-slice/partners-slice-types';
import { useAppSelector } from '../store/hooks';

import { PartnerList } from '../screens/screen-types';

const usePartners = (partnerListType: PartnerList) => {
  const selectPartners = useCallback(
    (state: RootState) => {
      const { partnerLists, partners } = state.partners;

      const sortPartners = (p1: PartnerDetails, p2: PartnerDetails) =>
        p1.locations.D.name.localeCompare(p2.locations.D.name, 'HU-hu');

      if (partnerListType === PartnerList.ALL) {
        return sort(sortPartners, partners);
      }

      const partnerList = partnerLists.find((list) => list.id === state.round.partnerListId);
      const partnerListIds = partnerList.partners.map((p) => p.id);

      return pipe(
        filter<PartnerDetails>((partner) => partnerListIds.includes(partner.id)),
        sort(sortPartners)
      )(partners);
    },
    [partnerListType]
  );

  return useAppSelector(selectPartners);
};

export default usePartners;
