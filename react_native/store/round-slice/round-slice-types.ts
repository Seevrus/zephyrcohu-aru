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
  quantity: number;
  itemAmount: number;
};

export type Item = Record<
  string, // item id
  Record<
    string, // expiresAt
    ExpirationItem
  >
>;

export type OrderItem = Record<string, number>; // item id, quantity

type Receipt = {
  isSent: boolean;
  partnerId: number;
  serialNumber: number;
  totalAmount: number;
  originalCopiesPrinted: number;
  items: Item;
  orderItems: OrderItem;
};

export type Round = {
  started: boolean;
  agentId: number;
  storeId: number;
  partnerListId: number;
  date: string;
  nextAvailableSerialNumber: number;
  currentReceipt: Partial<Receipt>;
  receipts: Receipt[];
};
