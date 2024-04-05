import { atom } from 'jotai';

import { type ReceiptItem } from '../api/request-types/common/ReceiptItemsTypes';
import { type CreateReceiptRequest } from '../api/request-types/CreateReceiptsRequestType';
import { atomWithAsyncStorage } from './helpers';

export type SelectedDiscount = {
  id: number;
  quantity: number;
  name: string;
} & (
  | {
      type: 'absolute' | 'percentage';
      amount: number;
      price?: undefined;
    }
  | {
      type: 'freeForm';
      amount?: undefined;
      price: number;
    }
);

export type ContextReceiptItem = ReceiptItem & {
  selectedDiscounts?: SelectedDiscount[];
};

export type ContextReceipt = Omit<CreateReceiptRequest, 'items'> & {
  id: number;
  isPrinted: boolean;
  isSent: boolean;
  shouldBeUpdated: boolean;
  items: ContextReceiptItem[];
};

export const receiptsAtom = atomWithAsyncStorage<ContextReceipt[]>(
  'boreal-receipts',
  []
);

export const currentReceiptAtom =
  atomWithAsyncStorage<Partial<ContextReceipt> | null>(
    'boreal-current-receipt',
    null
  );

export const numberOfReceiptsAtom = atom(async (get) => {
  const receipts = await get(receiptsAtom);
  return receipts.length;
});
