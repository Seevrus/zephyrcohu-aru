export type InitializeRoundRequest = {
  deviceId: string;
  token: string;

  agentId: number;
  agentCode: string;
  agentName: string;
  storeId: number;
  storeCode: string;
  storeName: string;
  partnerListId: number;
  partnerListName: string;
  date: string; // yyyy-MM-dd
  nextAvailableSerialNumber: number;
};

export type InitializeRoundResponse = {
  roundId: number;
  agentId: number;
  storeId: number;
  partnerListId: number;
  date: string;
  nextAvailableSerialNumber: number;
};

export type InitializeRoundApiResponse = {
  data: {
    roundId: number;
    agentCode: string;
    agentName: string;
    storeCode: string;
    storeName: string;
    partnerListId: number;
    partnerListName: string;
    roundAt: string; // yyyy-MM-dd
    lastSerialNumber: null;
    yearCode: null;
    createdAt: string; // yyyy-MM-dd HH-mm-ss
    updatedAt: string; // yyyy-MM-dd HH-mm-ss
  };
};

export type CancelReceiptResponse = {
  serialNumber: number;
  cancelSerialNumber: number;
};

export type UpsertReceiptsRequestT = {
  token: string;
  deviceId: string;
};

export type UploadOrdersRequestT = {
  token: string;
  deviceId: string;
};

export enum ReceiptTypeEnum {
  NORMAL,
  CANCEL,
}

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
  receiptType: ReceiptTypeEnum;
  CISerialNumber?: number;
  CIYearCode?: number;
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

type OrderPayloadItem = {
  articleNumber: string;
  quantity: number;
};

export type OrderRequestItem = {
  partnerCode: string;
  partnerSiteCode: string;
  orderDate: string;
  items: OrderPayloadItem[];
};

export type UpsertReceiptRequest = {
  data: ReceiptRequestItem[];
};

export type EndRoundApiRequest = {
  deviceId: string;
  token: string;

  roundId: number;
  lastSerialNumber?: number;
  yearCode?: number;
};

export type EndRoundApiResponse = {
  data: {
    roundId: number;
    agentCode: string;
    agentName: string;
    storeCode: string;
    storeName: string;
    roundAt: string; // yyyy-MM-dd
    lastSerialNumber: number;
    yearCode: number;
    createdAt: string; // yyyy-MM-dd HH-mm-ss
    updatedAt: string; // yyyy-MM-dd HH-mm-ss
  };
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
  type: ReceiptTypeEnum;
  isSent: boolean;
  partnerId: number;
  serialNumber: number;
  connectedSerialNumber?: number; // normal-cancel bidirectional connection, if there is one
  originalCopiesPrinted: number;
  items: Item;
  orderItems: OrderItem;
};

export type Round = {
  started: boolean;
  roundId: number;
  agentId: number;
  storeId: number;
  partnerListId: number;
  date: string; // yyyy-MM-dd
  nextAvailableSerialNumber: number;
  currentReceipt: Receipt;
  receipts: Receipt[];
};