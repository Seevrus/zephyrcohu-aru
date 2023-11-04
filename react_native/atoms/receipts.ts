import { atom } from 'jotai';
import { type ContextReceipt } from '../providers/types/receipts-provider-types';
import { atomWithAsyncStorage } from './helpers';

const receiptsAtom = atomWithAsyncStorage<ContextReceipt[]>(
  'boreal-receipts-context',
  []
);

export const currentReceiptAtom =
  atomWithAsyncStorage<Partial<ContextReceipt> | null>(
    'boreal-current-receipt-context',
    null
  );

export const numberOfReceiptsAtom = atom(async (get) => {
  const receipts = await get(receiptsAtom);
  return receipts.length;
});

export const isPartnerChosenForCurrentReceiptAtom = atom(async (get) => {
  const currentReceipt = await get(currentReceiptAtom);
  return !!currentReceipt?.buyer;
});
