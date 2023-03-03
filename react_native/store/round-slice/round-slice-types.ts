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

export type UpsertReceiptsRequestT = {
  token: string;
  deviceId: string;
};

export type ReceiptPayloadItem = {
  code: string;
  CNCode: string;
  articleNumber: string;
  expiresAt: string;
  name: string;
  quantity: number;
  unitName: string;
  netPrice: number;
  netAmount: number;
  vatRate: string;
  vatAmount: number;
  grossAmount: number;
};

export type ReceiptPlayloadVatAmount = {
  vatRate: string;
  netAmount: number;
  vatAmount: number;
  grossAmount: number;
};

export type ReceiptRequestItem = {
  companyCode: string;
  partnerCode: string;
  partnerSiteCode: string;
  serialNumber: number;
  yearCode: number;
  originalCopiesPrinted: number;
  vendor: {
    name: string;
    country: string;
    postalCode: string;
    city: string;
    address: string;
    felir: string;
    iban: string;
    bankAccount: string;
    vatNumber: string;
  };
  buyer: {
    name: string;
    country: string;
    postalCode: string;
    city: string;
    address: string;
    iban: string;
    bankAccount: string;
    vatNumber: string;
    deliveryName?: string;
    deliveryCountry?: string;
    deliveryPostalCode?: string;
    deliveryCity?: string;
    deliveryAddress?: string;
  };
  invoiceDate: string;
  fulfillmentDate: string;
  invoiceType: 'E' | 'P';
  paidDate: string;
  agent: {
    code: string;
    name: string;
    phoneNumber: string;
  };
  items: ReceiptPayloadItem[];
  quantity: number;
  netAmount: number;
  vatAmount: number;
  grossAmount: number;
  vatAmounts: ReceiptPlayloadVatAmount[];
  roundAmount: number;
  roundedAmount: number;
};

export type UpsertReceiptRequest = {
  data: ReceiptRequestItem[];
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
