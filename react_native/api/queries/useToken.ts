import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { isPast, parseISO } from 'date-fns';
import * as SecureStore from 'expo-secure-store';

type StoredToken = {
  token?: string;
  isPasswordExpired?: boolean;
  expiresAt?: string; // DateTime
};

type Token = {
  token: string | undefined;
  isPasswordExpired: boolean | undefined;
  isTokenExpired: boolean;
};

export function useToken(): UseQueryResult<Token> {
  return useQuery({
    queryKey: ['token'],
    queryFn: async (): Promise<Token> => {
      try {
        const rawToken = await SecureStore.getItemAsync('boreal-token');

        if (!rawToken) {
          return {
            token: null,
            isPasswordExpired: false,
            isTokenExpired: true,
          };
        }

        const {
          token,
          isPasswordExpired = true,
          expiresAt = '1970-01-01 00:00:00',
        }: StoredToken = JSON.parse(rawToken);

        return {
          token,
          isPasswordExpired: !token || isPasswordExpired,
          isTokenExpired: isPast(parseISO(expiresAt)),
        };
      } catch (error) {
        console.log(error.message);
        await SecureStore.deleteItemAsync('boreal-token');
        throw new Error('Váratlan hiba lépett fel a token olvasása során.');
      }
    },
    staleTime: 0,
    gcTime: 300_000,
  });
}
