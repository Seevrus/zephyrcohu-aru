export type InitializeRoundRequest = {
  agentId: number;
  storeId: number;
  partnerListId: number;
  date: string;
  nextAvailableSerialNumber: number;
};

export type InitializeRoundResponse = {
  agentId: number;
  storeId: number;
  partnerListId: number;
  date: string;
  nextAvailableSerialNumber: number;
};

export type ExpirationItem = {
  name: string;
  quantity: number;
};

export type Item = Record<
  string, // item id
  Record<
    string, // expiresAt
    ExpirationItem
  >
>;

export type OrderItem = Record<
  string,
  {
    name: string;
    quantity: number;
  }
>; // item id, order data

export type Receipt = {
  isSent: boolean;
  partnerId: number;
  serialNumber: number;
  originalCopiesPrinted: number;
  items: Item;
  orderItems: OrderItem;
};

export type Round = {
  started: boolean;
  agentId: number;
  storeId: number;
  partnerListId: number;
  date: string; // yyyy-MM-dd
  nextAvailableSerialNumber: number;
  currentReceipt: Receipt;
  receipts: Receipt[];
};
