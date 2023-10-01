import { PartnerType } from './common/PartnerType';
import { TimeStamps } from './common/TimeStamps';

export type PartnersListResponseData = ({
  id: number;
  name: string;
  partners: PartnerType[];
} & TimeStamps)[];

export type PartnersListResponseType = {
  data: PartnersListResponseData;
};
