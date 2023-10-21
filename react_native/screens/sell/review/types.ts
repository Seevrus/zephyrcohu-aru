import { Discount } from '../../../api/response-types/ItemsResponseType';

export type ReviewRow = {
  itemId: number;
  articleNumber: string;
  name: string;
  expirationId: number;
  expiresAt: string;
  quantity: number;
  unitName: string;
  netPrice: number;
  grossAmount: number;
  availableDiscounts: Discount[] | null;
};
