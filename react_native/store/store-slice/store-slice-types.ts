export type FetchStoreRequest = {
  deviceId: string;
  token: string;
  code: string;
};

export type FetchStoreResponse = Store;

type StoreItem = {
  id: number;
  code: string;
  expirations: {
    expiresAt: string;
    quantity: number;
  }[];
};

export type Store = {
  id: number;
  code: string;
  name: string;
  firstAvailableSerialNumber: number;
  lastAvailableSerialNumber: number;
  yearCode: number;
  items: StoreItem[];
  partners: number[];
};
