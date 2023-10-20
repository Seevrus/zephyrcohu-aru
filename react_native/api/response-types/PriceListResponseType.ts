import { BasePriceListType } from './common/BasePriceListType';

type PriceListItemType = {
  itemId: number;
  articleNumber: string;
  netPrice: number;
};

export type PriceListType = BasePriceListType & {
  items: PriceListItemType[];
};

export type PriceListResponseData = PriceListType[];

export type PriceListResponseType = {
  data: PriceListResponseData;
};
