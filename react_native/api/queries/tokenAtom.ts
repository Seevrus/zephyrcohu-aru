import { isPast, parseISO } from 'date-fns';
import * as SecureStore from 'expo-secure-store';
import { atomsWithQuery } from 'jotai-tanstack-query';

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

const [, tokenAtom] = atomsWithQuery(() => ({
  queryKey: ['token'],
  queryFn: async (): Promise<Token> => {
    const defaultToken = {
      token: '',
      isPasswordExpired: false,
      isTokenExpired: true,
    };

    try {
      const rawToken = await SecureStore.getItemAsync('boreal-token');

      if (!rawToken) {
        return defaultToken;
      }

      const {
        token = '',
        isPasswordExpired = false,
        expiresAt = '1970-01-01 00:00:00',
      }: StoredToken = JSON.parse(rawToken);

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
  },
}));

export { tokenAtom };
