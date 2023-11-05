import { atom } from 'jotai';

import { type Partner } from '../api/response-mappers/mapPartnersResponse';

export const maxNewPartnerIdInUseAtom = atom(0);
export const selectedPartnerAtom = atom<Partner | null>(null);
