import { useNetInfo } from '@react-native-community/netinfo';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { useAtom, useAtomValue } from 'jotai';

import {
  defaultStoredToken,
  storedTokenAtom,
  tokenAtom,
} from '../../atoms/token';
import env from '../../env.json';
import {
  mapCheckTokenResponse,
  type CheckToken,
} from '../response-mappers/mapCheckTokenResponse';
import { type LoginResponse } from '../response-types/LoginResponseType';

export function useCheckToken() {
  const { isInternetReachable } = useNetInfo();
  const queryClient = useQueryClient();

  const [, setStoredToken] = useAtom(storedTokenAtom);
  const { token } = useAtomValue(tokenAtom);

  return useQuery({
    queryKey: ['check-token'],
    queryFn: async (): Promise<CheckToken> => {
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

        return mapCheckTokenResponse(response.data);
      } catch (error) {
        if (isAxiosError(error)) {
          // eslint-disable-next-line no-console
          console.log('useCheckToken', error.response?.data);

          if (error.response?.status === 401) {
            await queryClient.invalidateQueries({ queryKey: ['token'] });
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
