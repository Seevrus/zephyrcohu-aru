export type InitializeRoundRequest = {
  storeId: number;
  nextAvailableSerialNumber: number;
};

export type InitializeRoundResponse = {
  storeId: number;
  nextAvailableSerialNumber: number;
};

type Item = {
  id: number;
  articleNumber: string;
  expirations: {
    expiresAt: string;
    quantity: number;
    itemAmount: number;
  }[];
};

type OrderItem = {
  id: number;
  articleNumber: string;
  quantity: number;
};

type Receipt = {
  partnerId: number;
  serialNumber: number;
  totalAmount: number;
  createdAt: string;
  items: Item[];
  orderItems: OrderItem[];
  isSent: boolean;
};

export type Round = {
  storeId: number;
  nextAvailableSerialNumber: number;
  receipts: Receipt[];
};
