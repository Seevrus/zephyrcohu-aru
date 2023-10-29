import { ReceiptBuyer } from '../request-types/common/ReceiptBuyer';
import { ReceiptItem, ReceiptOtherItem } from '../request-types/common/ReceiptItemsTypes';
import { ReceiptVatAmount } from '../request-types/common/ReceiptVatAmount';
import { ReceiptVendor } from '../request-types/common/ReceiptVendor';
import { TimeStamps } from './common/TimeStamps';

type ReceiptUser = {
  id: number;
  code: string;
  name: string;
  phoneNumber: string;
};

type ReceiptResponse = {
  id: number;
  companyId: number;
  companyCode: string;
  partnerId: number;
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
  user: ReceiptUser;
  items: ReceiptItem[];
  otherItems: ReceiptOtherItem[] | null;
  quantity: number;
  netAmount: number;
  vatAmount: number;
  grossAmount: number;
  vatAmounts: ReceiptVatAmount[];
  roundAmount: number;
  roundedAmount: number;
  lastDownloadedAt: string | null; // UTC
} & TimeStamps;

export type ReceiptResponseData = ReceiptResponse[];

export type ReceiptsResponseType = {
  data: ReceiptResponseData;
};
