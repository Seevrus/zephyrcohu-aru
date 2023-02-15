export type InitializeRoundRequest = {
  storeId: number;
  nextAvailableSerialNumber: number;
};

export type InitializeRoundResponse = {
  storeId: number;
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
  partnerId: number;
  serialNumber: number;
  totalAmount: number;
  createdAt: string;
  items: Item;
  orderItems: OrderItem;
  isSent: boolean;
};

export type Round = {
  storeId: number;
  nextAvailableSerialNumber: number;
  currentReceipt: Partial<Receipt>;
  receipts: Receipt[];
};
