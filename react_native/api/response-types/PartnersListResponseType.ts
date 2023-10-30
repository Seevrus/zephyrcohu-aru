import { type TimeStamps } from './common/TimeStamps';

export type PartnersListResponseData = ({
  id: number;
  name: string;
  partners: number[];
} & TimeStamps)[];

export type PartnersListResponseType = {
  data: PartnersListResponseData;
};
