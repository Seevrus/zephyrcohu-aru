import { type RoundType } from './common/RoundType';

export type ActiveRoundResponseData = RoundType;

type RoundsResponseData = RoundType[];

export type RoundsResponseType = {
  data: RoundsResponseData;
};
