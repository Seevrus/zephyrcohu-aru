import { ExpirationChange } from './common/ExpirationChange';

type SaveSelectedItemsRequestData = {
  primaryStoreId: number;
  changes: ExpirationChange[];
};

export type SaveSelectedItemsRequest = {
  data: SaveSelectedItemsRequestData;
};
