import { BasePriceListType } from './common/BasePriceListType';
import { PartnerType } from './common/PartnerType';

export type PartnersResponseData = (PartnerType & {
  priceList: BasePriceListType;
})[];

export type PartnersResponseType = {
  data: PartnersResponseData;
};
