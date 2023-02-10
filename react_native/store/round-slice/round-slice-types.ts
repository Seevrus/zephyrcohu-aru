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
  serialNumber: number;
  totalAmount: number;
  createdAt: string;
  items: Item[];
  orderItems: OrderItem[];
  isSent: boolean;
};

export type Round = {
  nextAvailableSerialNumber: number;
  receipts: Receipt[];
};
