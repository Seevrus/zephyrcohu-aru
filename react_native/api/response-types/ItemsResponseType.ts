import { BaseItemType } from './common/BaseItemType';
import { TimeStamps } from './common/TimeStamps';

export type Expiration = {
  id: number;
  barcode: string | null;
  expiresAt: string; // UTC
} & TimeStamps;

export type Discount = {
  id: number;
  name: string;
  type: 'absolute' | 'percentage' | 'freeForm';
  amount: number;
} & TimeStamps;

export type ItemType = BaseItemType & {
  CNCode: string;
  barcode: string | null;
  productCatalogCode: string;
  expirations: Expiration[];
  discounts: Discount[] | null;
};

export type ItemsResponseData = ItemType[];

export type ItemsResponseType = {
  data: ItemsResponseData;
};
