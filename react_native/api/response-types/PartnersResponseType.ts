import { type BasePriceListType } from './common/BasePriceListType';
import { type PartnerType } from './common/PartnerType';

export type PartnersResponseData = (PartnerType & {
  priceList: BasePriceListType;
})[];

export type PartnersResponseType = {
  data: PartnersResponseData;
};
