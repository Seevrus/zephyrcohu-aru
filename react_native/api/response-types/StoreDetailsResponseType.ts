import { type StoreType } from './common/StoreType';

export type StoreDetailsResponseData = StoreType & {
  expirations: StoreDetailsResponseExpiration[];
};

type StoreDetailsResponseExpiration = {
  itemId: number;
  expirationId: number;
  quantity: number;
};

export type StoreDetailsResponseType = {
  data: StoreDetailsResponseData;
};
