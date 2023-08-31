import { UserType } from './common/UserType';

export type StoreDetailsResponseData = {
  id: number;
  code: string;
  name: string;
  type: 'P' | 'S';
  state: 'I' | 'L' | 'R';
  firstAvailableSerialNumber: number;
  lastAvailableSerialNumber: number;
  yearCode: number;
  expirations: StoreDetailsResponseExpiration[];
  user: UserType;
  createdAt: string; // UTC
  updatedAt: string; // UTC
};

type StoreDetailsResponseExpiration = {
  itemId: number;
  expirationId: number;
  quantity: number;
};

export type StoreDetailsResponseType = {
  data: StoreDetailsResponseData;
};
