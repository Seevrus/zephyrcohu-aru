export type FetchItemsRequest = {
  deviceId: string;
  token: string;
};

export type FetchItemsResponse = Items;

export type Item = {
  id: number;
  articleNumber: string;
  name: string;
  shortName: string;
  category: string;
  unitName: string;
  productCatalogCode: string;
  vatRate: string;
  price: number;
};

export type Items = {
  data: Item[];
};
