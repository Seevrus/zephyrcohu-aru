import { useQuery } from '@tanstack/react-query';
import { isPast, parseISO } from 'date-fns';
import { useAtom } from 'jotai';
import { defaultStoredToken, tokenAtom } from '../../atoms/token';

type Token = {
  token: string;
  isPasswordExpired: boolean;
  isTokenExpired: boolean;
};

export function useToken() {
  const [{ token, isPasswordExpired, expiresAt }, setStoredToken] =
    useAtom(tokenAtom);

  const defaultToken: Token = {
    token: '',
    isPasswordExpired: false,
    isTokenExpired: true,
  };

  return useQuery({
    queryKey: ['token'],
    queryFn: async (): Promise<Token> => {
      try {
        return {
          token,
          isPasswordExpired: !token || isPasswordExpired,
          isTokenExpired: isPast(parseISO(expiresAt)),
        };
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log('useToken:', error?.message);

        await setStoredToken(defaultStoredToken);
        return defaultToken;
      }
    },
  });
}
