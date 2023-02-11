export type FetchPartnersRequest = {
  deviceId: string;
  token: string;
};

export type FetchPartnersResponse = Partners;

type PriceList = {
  id: number;
  code: string;
  items: {
    itemId: number;
    price: number;
  }[];
};

type Partner = {
  id: number;
  storeId?: number;
  code: string;
  siteCode: string;
  name: string;
  country: string;
  postalCode: string;
  city: string;
  address: string;
  vatNumber: string;
  iban: string;
  bankAccount: string;
  phoneNumber?: string;
  email?: string;
  priceList?: PriceList;
};

export type Partners = {
  data: Partner[];
};
