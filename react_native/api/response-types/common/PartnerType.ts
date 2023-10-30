import { type TimeStamps } from './TimeStamps';

export type PartnerLocation = {
  name: string;
  locationType: 'C' | 'D';
  country: string;
  postalCode: string;
  city: string;
  address: string;
} & TimeStamps;

export type PartnerType = {
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
} & TimeStamps;
