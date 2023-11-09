import { type BasePriceListType } from './common/BasePriceListType';

type PriceListItemType = {
  itemId: number;
  articleNumber: string;
  netPrice: number;
};

type PriceListType = BasePriceListType & {
  items: PriceListItemType[];
};

export type PriceListResponseData = PriceListType[];

export type PriceListResponseType = {
  data: PriceListResponseData;
};
