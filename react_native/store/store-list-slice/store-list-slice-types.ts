export type FetchStoreRequest = {
  deviceId: string;
  token: string;
};

export type FetchStoreResponse = {
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
