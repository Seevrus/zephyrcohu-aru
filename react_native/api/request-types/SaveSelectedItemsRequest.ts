export type ExpirationChange = {
  expirationId: number;
  quantityChange: number;
};

type SaveSelectedItemsRequestData = {
  primaryStoreId: number;
  changes: ExpirationChange[];
};

export type SaveSelectedItemsRequest = {
  data: SaveSelectedItemsRequestData;
};
