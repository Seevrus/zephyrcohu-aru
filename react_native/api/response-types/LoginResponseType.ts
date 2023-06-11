export type LoginResponse = {
  id: number;
  code: string;
  userName: string;
  name: string;
  company: Company;
  phoneNumber: string;
  roles: UserRole[];
  createdAt: string;
  updatedAt: string;
  lastActive: string;
  token: Token;
};

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

export type Token = {
  tokenType: string;
  accessToken: string;
  abilities: UserRole[] | ['password'];
  expiresAt: string;
};

type UserRole = 'AM' | 'I';
