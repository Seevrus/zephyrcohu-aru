import { useNetInfo } from '@react-native-community/netinfo';
import { useQuery } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { useAtom, useAtomValue } from 'jotai';

import {
  defaultStoredToken,
  storedTokenAtom,
  tokenAtom,
} from '../../atoms/token';
import env from '../../env.json';
import { queryKeys } from '../keys';
import {
  type CheckToken,
  mapCheckTokenResponse,
} from '../response-mappers/mapCheckTokenResponse';
import { type LoginResponse } from '../response-types/LoginResponseType';

export function useCheckToken() {
  const { isInternetReachable } = useNetInfo();

  const [, setStoredToken] = useAtom(storedTokenAtom);
  const { token } = useAtomValue(tokenAtom);

  return useQuery({
    queryKey: queryKeys.checkToken,
    async queryFn(): Promise<CheckToken> {
      try {
        const response = await axios.get<LoginResponse>(
          `${env.api_url}/users/check-token`,
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const isPasswordExpired = response.data.token.abilities.includes(
          'password' as never
        );

        if (isPasswordExpired) {
          await setStoredToken(async (prevToken) => ({
            ...(await prevToken),
            isPasswordExpired: true,
          }));
        }

        return mapCheckTokenResponse(response.data);
      } catch (error) {
        if (isAxiosError(error)) {
          // eslint-disable-next-line no-console
          console.log('useCheckToken', error.response?.data);

          if (error.response?.status === 401) {
            await setStoredToken(defaultStoredToken);
          }
        }

        throw new Error('A megadott token nem érvényes.');
      }
    },
    enabled: isInternetReachable === true && !!token,
    staleTime: 300_000,
    retry: false,
  });
}
