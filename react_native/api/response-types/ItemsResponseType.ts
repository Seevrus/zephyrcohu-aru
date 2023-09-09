type Expiration = {
  id: number;
  barcode: string | null;
  expiresAt: string; // UTC
  createdAt: string; // UTC
  updatedAt: string; // UTC
};

type Discount = {
  id: number;
  name: string;
  type: 'absolute' | 'percentage' | 'freeForm';
  amount: number;
  createdAt: string; // UTC
  updatedAt: string; // UTC
};

type Item = {
  id: number;
  CNCode: string;
  articleNumber: string;
  barcode: string | null;
  name: string;
  shortName: string;
  unitName: string;
  productCatalogCode: string;
  vatRate: string;
  netPrice: number;
  expirations: Expiration[];
  discounts: Discount[];
  createdAt: string; // UTC
  updatedAt: string; // UTC
};

export type ItemsResponseData = Item[];

export type ItemsResponseType = {
  data: ItemsResponseData;
};
