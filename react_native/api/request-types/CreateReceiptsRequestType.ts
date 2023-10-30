import { type ReceiptBuyer } from './common/ReceiptBuyer';
import {
  type ReceiptItem,
  type ReceiptOtherItem,
} from './common/ReceiptItemsTypes';
import { type ReceiptVatAmount } from './common/ReceiptVatAmount';
import { type ReceiptVendor } from './common/ReceiptVendor';

export type CreateReceiptRequest = {
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

export type CreateReceiptRequestData = CreateReceiptRequest[];
