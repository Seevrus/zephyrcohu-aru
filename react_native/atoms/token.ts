import { isPast, parseISO } from 'date-fns';
import { atom } from 'jotai';

import { atomWithSecureStorage } from './helpers';

type StoredToken = {
  token: string;
  isPasswordExpired: boolean;
  expiresAt: string; // DateTime
};

type Token = {
  token: string;
  isPasswordExpired: boolean;
  isTokenExpired: boolean;
};

export const defaultStoredToken: StoredToken = {
  token: '',
  isPasswordExpired: false,
  expiresAt: '1970-01-01 00:00:00',
};

export const storedTokenAtom = atomWithSecureStorage<StoredToken>(
  'boreal-token',
  defaultStoredToken
);

export const tokenAtom = atom<Promise<Token>>(async (get) => {
  const { token, isPasswordExpired, expiresAt } = await get(storedTokenAtom);

  return {
    token,
    isPasswordExpired,
    isTokenExpired: isPast(parseISO(expiresAt)),
  };
});
