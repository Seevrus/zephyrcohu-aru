export type RoundType = {
  id: number;
  userId: number;
  storeId: number;
  partnerListId: number;
  lastSerialNumber: number | null;
  yearCode: number | null;
  roundStarted: string; // UTC
  roundFinished: number | null;
  createdAt: string; // UTC
  updatedAt: string; // UTC
};
