import { type RoundType } from './common/RoundType';

type FinishRoundResponseData = Omit<
  RoundType,
  'lastSerialNumber' | 'yearCode' | 'roundFinished'
> & {
  lastSerialNumber: number;
  yearCode: number;
  roundFinished: string; // UTC
};

export type FinishRoundResponseType = {
  data: FinishRoundResponseData;
};
