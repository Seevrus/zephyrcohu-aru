import { type ExpirationChange } from './common/ExpirationChange';

type SellSelectedItemsRequestData = {
  changes: ExpirationChange[];
};

export type SellSelectedItemsRequest = {
  data: SellSelectedItemsRequestData;
};
