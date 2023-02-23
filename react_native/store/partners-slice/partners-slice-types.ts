export type FetchPartnerListRequest = {
  deviceId: string;
  token: string;
};

export type FetchPartnerListResponse = {
  data: PartnerList[];
};

export type FetchPartnersRequest = {
  deviceId: string;
  token: string;
};

type PartnerResponse = {
  id: number;
  code: string;
  siteCode: string;
  vatNumber: string;
  invoiceType: 'E' | 'P';
  invoiceCopies: number;
  paymentDays: number;
  iban: string;
  bankAccount: string;
  phoneNumber?: string;
  email?: string;
  locations: PartnerLocation[];
  priceList: PriceListItem[];
};

export type FetchPartnersResponse = {
  data: PartnerResponse[];
};

type Partner = {
  id: number;
  code: string;
  siteCode: string;
};

type PartnerList = {
  id: number;
  name: string;
  partners: Partner[];
};

type PriceListItem = {
  itemId: number;
  articleNumber: string;
  netPrice: number;
};

type PartnerLocation = {
  name: string;
  locationType: 'C' | 'D';
  country: string;
  postalCode: string;
  city: string;
  address: string;
};

export type PartnerDetails = {
  id: number;
  code: string;
  siteCode: string;
  vatNumber: string;
  invoiceType: 'E' | 'P';
  invoiceCopies: number;
  paymentDays: number;
  iban: string;
  bankAccount: string;
  phoneNumber?: string;
  email?: string;
  locations: Record<PartnerLocation['locationType'], PartnerLocation>;
  priceList: Record<number, PriceListItem>; // id, PriceListItem
};

export type PartnersSlice = {
  partnerLists: PartnerList[];
  partners: PartnerDetails[];
};
