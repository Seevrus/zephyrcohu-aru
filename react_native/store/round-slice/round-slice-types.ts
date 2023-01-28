type Purchase = {
  expiresAt: Date;
  quantity: number;
  itemAmount: number;
};

type Order = {
  quantity: number;
  itemAmount: number;
};

type Transaction = {
  productId: string;
  purchases?: Purchase[];
  order?: Order;
};

type Receipt = {
  clientId: number;
  receiptNr: string;
  transactions: Transaction[];
  totalAmount: number;
  createdAt: Date;
};

export type Round = {
  id: number;
  name: string;
  clientIds: number[];
  firstAvailableReceiptNr: string;
  receipts: Receipt[];
};
