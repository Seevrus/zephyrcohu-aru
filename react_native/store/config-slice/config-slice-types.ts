import userTypes from '../../constants/userTypes';

type Company = {
  id: number;
  code: string;
  name: string;
  country: string;
  postalCode: string;
  city: string;
  address: string;
  felir: string;
  vatNumber: string;
  iban: string;
  bankAccount: string;
  phoneNumber?: string;
  email?: string;
};

export type Config = {
  userType: (typeof userTypes)[keyof typeof userTypes];
  company: Company;
};

export type RegisterDeviceRequestT = {
  token: string;
  deviceId: string;
};

export type RegisterDeviceResponseT = {
  data: { type: (typeof userTypes)[keyof typeof userTypes]; company: Company };
};

export type CheckTokenRequestT = {
  deviceId: string;
  token: string;
};

export type CheckTokenResponseT = {
  data: { type: (typeof userTypes)[keyof typeof userTypes]; company: Company };
};
