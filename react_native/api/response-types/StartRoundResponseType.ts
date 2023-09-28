import { RoundType } from './common/RoundType';

export type StartRoundResponseData = Omit<
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
