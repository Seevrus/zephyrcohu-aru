import { atomWithSecureStorage } from './helpers';

type StoredToken = {
  token: string;
  isPasswordExpired: boolean;
  expiresAt: string; // DateTime
};

export const defaultStoredToken: StoredToken = {
  token: '',
  isPasswordExpired: false,
  expiresAt: '1970-01-01 00:00:00',
};

export const tokenAtom = atomWithSecureStorage<StoredToken>(
  'boreal-token',
  defaultStoredToken
);
