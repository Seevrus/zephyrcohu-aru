export type UpdateReceiptRequest = {
  id: number;
  originalCopiesPrinted: number;
};

export type UpdateReceiptsRequestData = UpdateReceiptRequest[];

export type UpdateReceiptsRequestType = {
  data: UpdateReceiptsRequestData;
};