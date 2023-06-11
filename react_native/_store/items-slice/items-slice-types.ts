export type FetchItemsRequest = {
  deviceId: string;
  token: string;
};

export type FetchItemsResponse = Items;

export type Item = {
  id: number;
  CNCode: string;
  articleNumber: string;
  name: string;
  shortName: string;
  category: string;
  unitName: string;
  productCatalogCode: string;
  vatRate: string;
  netPrice: number;
};

export type Items = {
  data: Item[];
};
