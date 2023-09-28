export type StartRoundResponseData = {
  id: number;
  userId: number;
  storeId: number;
  partnerListId: number;
  lastSerialNumber: null;
  yearCode: null;
  roundStarted: string; // UTC
  roundFinished: null;
  createdAt: string; // UTC
  updatedAt: string; // UTC
};

export type StartRoundResponseType = {
  data: StartRoundResponseData;
};
