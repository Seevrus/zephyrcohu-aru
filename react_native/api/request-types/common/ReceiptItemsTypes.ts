type ReceiptBaseItem = {
  id: number;
  articleNumber: string;
  name: string;
  quantity: number;
  unitName: string;
  netPrice: number;
  netAmount: number;
  vatRate: string;
  vatAmount: number;
  grossAmount: number;
};

export type ReceiptOtherItem = ReceiptBaseItem & {
  comment: string | undefined;
};

export type ReceiptItem = ReceiptBaseItem & {
  discountName?: string;
  expirationId: number;
  CNCode: string;
  expiresAt: string; // yyyy-MM
};
