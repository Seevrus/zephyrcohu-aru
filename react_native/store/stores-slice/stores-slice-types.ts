export type FetchStoreListRequest = {
  deviceId: string;
  token: string;
};

export type FetchStoreListResponse = {
  data: Store[];
};

type Store = {
  id: number;
  code: string;
  name: string;
};

export type FetchStoreRequest = {
  deviceId: string;
  token: string;
  code: string;
};

export type FetchStoreResponseItem = {
  id: number;
  articleNumber: string;
  expirations: Expiration[];
};

export type FetchStoreResponse = {
  data: {
    id: number;
    code: string;
    name: string;
    firstAvailableSerialNumber: number;
    lastAvailableSerialNumber: number;
    yearCode: number;
    items: FetchStoreResponseItem[];
  };
};

export type Expiration = {
  expiresAt: string;
  quantity: number;
};

type StoreItem = {
  id: number;
  articleNumber: string;
  expirations: Record<string, Expiration>;
};

export type StoreDetails = {
  id: number;
  code: string;
  name: string;
  firstAvailableSerialNumber: number;
  lastAvailableSerialNumber: number;
  yearCode: number;
  items: Record<string, StoreItem>; // id, StoreItem
};

export type StoresSlice = {
  storeList: Store[];
  store: StoreDetails;
};
