import { atom } from 'jotai';

import { type Partners } from '../../api/response-mappers/mapPartnersResponse';
import { partnerListsAtom } from '../../api/queries/partnerListstAtom';
import { activeRoundAtom } from '../../api/queries/activeRoundAtom';

const selectedPartnerAtom = atom<Partners[number] | null>(null);

const currentPartnerListAtom = atom(async (get) => {
  const { data: partnerLists } = await get(partnerListsAtom);
  const { data: activeRound } = await get(activeRoundAtom);

  return partnerLists?.find(
    (partnerList) => partnerList.id === activeRound?.partnerListId
  );
});

export const isSelectedPartnerOnCurrentPartnerListAtom = atom(async (get) => {
  const currentPartnerList = await get(currentPartnerListAtom);
  const selectedPartner = get(selectedPartnerAtom);

  return !currentPartnerList || !selectedPartner
    ? false
    : currentPartnerList?.partners?.includes(selectedPartner.id);
});
