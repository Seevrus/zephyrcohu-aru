type ReceiptVendor = {
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

export type ReceiptBuyer = {
  id: number;
  name: string;
  country: string;
  postalCode: string;
  city: string;
  address: string;
  deliveryName: string;
  deliveryCountry: string;
  deliveryPostalCode: string;
  deliveryCity: string;
  deliveryAddress: string;
  iban: string;
  bankAccount: string;
  vatNumber: string;
};

type ReceiptItem = {
  id: number;
  CNCode: string;
  articleNumber: string;
  expiresAt: string; // yyyy-MM
  name: string;
  quantity: number;
  unitName: string;
  netPrice: number;
  netAmount: number;
  vatRate: string;
  vatAmount: number;
  grossAmount: number;
};

type ReceiptVatAmount = {
  vatRate: string;
  netAmount: number;
  vatAmount: number;
  grossAmount: number;
};

export type ReceiptRequest = {
  partnerCode: string;
  partnerSiteCode: string;
  serialNumber: number;
  yearCode: number;
  originalCopiesPrinted: number;
  vendor: ReceiptVendor;
  buyer: ReceiptBuyer;
  invoiceDate: string; // yyyy-MM-dd
  fulfillmentDate: string; // yyyy-MM-dd
  invoiceType: 'P' | 'E';
  paidDate: string; // yyyy-MM-dd
  items: ReceiptItem[];
  quantity: number;
  netAmount: number;
  vatAmount: number;
  grossAmount: number;
  vatAmounts: ReceiptVatAmount[];
  roundAmount: number;
  roundedAmount: number;
};

type ReceiptRequestData = ReceiptRequest[];

export type CreateReceiptsRequest = {
  data: ReceiptRequestData;
};
