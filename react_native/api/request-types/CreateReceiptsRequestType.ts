import { ReceiptBuyer } from './common/ReceiptBuyer';
import { ReceiptItem, ReceiptOtherItem } from './common/ReceiptItemsTypes';
import { ReceiptVatAmount } from './common/ReceiptVatAmount';
import { ReceiptVendor } from './common/ReceiptVendor';

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
  otherItems?: ReceiptOtherItem[];
  quantity: number;
  netAmount: number;
  vatAmount: number;
  grossAmount: number;
  vatAmounts: ReceiptVatAmount[];
  roundAmount: number;
  roundedAmount: number;
};

export type ReceiptRequestData = ReceiptRequest[];

export type CreateReceiptsRequestType = {
  data: ReceiptRequestData;
};
