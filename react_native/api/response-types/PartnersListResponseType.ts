type PartnerLocation = {
  name: string;
  locationType: 'C' | 'D';
  country: string;
  postalCode: string;
  city: string;
  address: string;
  createdAt: string; // UTC
  updatedAt: string; // UTC
};

type Partner = {
  id: number;
  code: string;
  siteCode: string;
  vatNumber: string;
  invoiceType: 'P' | 'E';
  invoiceCopies: number;
  paymentDays: number;
  iban: string;
  bankAccount: string;
  phoneNumber: string | null;
  email: string | null;
  locations: PartnerLocation[];
  createdAt: string; // UTC
  updatedAt: string; // UTC
};

export type PartnersListResponseData = {
  id: number;
  name: string;
  partners: Partner[];
  createdAt: string; // UTC
  updatedAt: string; // UTC
}[];

export type PartnersListResponseType = {
  data: PartnersListResponseData;
};
