import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { isPast, parseISO } from 'date-fns';
import * as SecureStore from 'expo-secure-store';
import { atom } from 'jotai';

import { queryClient } from '../queryClient';

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

export function useToken(): UseQueryResult<Token> {
  return useQuery({
    queryKey: tokenQueryKey,
    queryFn: fetchToken,
    staleTime: 300_000,
  });
}

export const tokenAtom = atom(
  async () =>
    await queryClient.fetchQuery({
      queryKey: tokenQueryKey,
      queryFn: fetchToken,
      staleTime: 300_000,
    })
);

const tokenQueryKey = ['token'];

async function fetchToken(): Promise<Token> {
  const defaultToken = {
    token: '',
    isPasswordExpired: true,
    isTokenExpired: true,
  };

  try {
    const rawToken = await SecureStore.getItemAsync('boreal-token');

    if (!rawToken) {
      return defaultToken;
    }

    const {
      token = '',
      isPasswordExpired = true,
      expiresAt = '1970-01-01 00:00:00',
    }: StoredToken = JSON.parse(rawToken);

    console.log(expiresAt);

    return {
      token,
      isPasswordExpired: !token || isPasswordExpired,
      isTokenExpired: isPast(parseISO(expiresAt)),
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('useToken:', error?.message);

    await SecureStore.deleteItemAsync('boreal-token');
    return defaultToken;
  }
}
