import { atom } from 'jotai';

import { type Partner } from '../api/response-mappers/mapPartnersResponse';
import { type Discount } from '../api/response-types/ItemsResponseType';
import { atomWithAsyncStorage } from './helpers';
import { type SelectedDiscount } from './receipts';

type SelectedOtherItems = Record<
  number,
  {
    netPrice: number | null;
    quantity: number | null;
    comment: string | null;
  }
>;

type BaseReviewItem = {
  itemId: number;
  articleNumber: string;
  name: string;
  quantity: number;
  unitName: string;
  netPrice: number;
  vatRate: string;
  grossAmount: number;
};

export type RegularReviewItem = BaseReviewItem & {
  type: 'item';
  expirationId: number;
  expiresAt: string;
  availableDiscounts: Discount[] | null;
  selectedDiscounts?: SelectedDiscount[];
};

export type OtherReviewItem = BaseReviewItem & {
  type: 'otherItem';
  comment: string | undefined;
  selectedDiscounts?: undefined;
};

export type ReviewItem = RegularReviewItem | OtherReviewItem;

export const maxNewPartnerIdInUseAtom = atomWithAsyncStorage(
  'boreal-max-partner-id-in-use',
  0
);

export const selectedPartnerAtom = atom<Partner | null>(null);

export const selectedItemsAtom = atom<Record<string, Record<string, number>>>(
  {}
);

export const selectedOtherItemsAtom = atom<SelectedOtherItems>({});
export const reviewItemsAtom = atom<ReviewItem[] | null>(null);
