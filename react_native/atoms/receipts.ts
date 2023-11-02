import { atom } from 'jotai';
import { type ContextReceipt } from '../providers/types/receipts-provider-types';

const receiptsAtom = atom<ContextReceipt[]>([]);

const currentReceiptAtom = atom<Partial<ContextReceipt> | null>(null);

export const numberOfReceiptsAtom = atom(
  async (get) => await get(receiptsAtom).length
);

export const isPartnerChosenForCurrentReceiptAtom = atom(
  (get) => !!get(currentReceiptAtom)?.buyer
);
