import { type RoundType } from './common/RoundType';

type StartRoundResponseData = Omit<
  RoundType,
  'lastSerialNumber' | 'yearCode' | 'roundFinished'
> & {
  lastSerialNumber: null;
  yearCode: null;
  roundFinished: null;
};

export type StartRoundResponseType = {
  data: StartRoundResponseData;
};
