export type FetchStoreRequest = {
  deviceId: string;
  token: string;
  code: string;
};

export type FetchStoreResponseItem = {
  id: number;
  code: string;
  expirations: Expiration[];
};

export type FetchStoreResponse = {
  id: number;
  code: string;
  name: string;
  firstAvailableSerialNumber: number;
  lastAvailableSerialNumber: number;
  yearCode: number;
  items: FetchStoreResponseItem[];
  partners: number[];
};

export type Expiration = {
  expiresAt: string;
  quantity: number;
};

type StoreItem = {
  id: number;
  code: string;
  expirations: Record<string, Expiration>;
};

export type Store = {
  id: number;
  code: string;
  name: string;
  firstAvailableSerialNumber: number;
  lastAvailableSerialNumber: number;
  yearCode: number;
  items: Record<string, StoreItem>; // id, StoreItem
  partners: number[];
};
