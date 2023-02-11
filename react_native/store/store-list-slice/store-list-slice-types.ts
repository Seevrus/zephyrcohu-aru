export type FetchStoresRequest = {
  deviceId: string;
  token: string;
};

export type FetchStoresResponse = {
  data: StoreList['data'];
};

export type StoreList = {
  fetched: boolean;
  data: {
    id: number;
    code: string;
    name: string;
  }[];
};
