import axios, { isAxiosError } from 'axios';
import { atomsWithQueryAsync } from 'jotai-tanstack-query';

import { netInfoAtom } from '../../atoms/helpers';
import env from '../../env.json';
import {
  mapCheckTokenResponse,
  type CheckToken,
} from '../response-mappers/mapCheckTokenResponse';
import { type LoginResponse } from '../response-types/LoginResponseType';
import { tokenAtom } from './useToken';

const [, checkTokenAtom] = atomsWithQueryAsync(async (get) => {
  const isInternetReachable = await get(netInfoAtom);
  const { isSuccess: isTokenSuccess, data: tokenData } = get(tokenAtom);

  return {
    queryKey: ['check-token'],
    queryFn: async (): Promise<CheckToken> => {
      try {
        const response = await axios.get<LoginResponse>(
          `${env.api_url}/users/check-token`,
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${tokenData?.token}`,
            },
          }
        );

        return mapCheckTokenResponse(response.data);
      } catch (error) {
        if (isAxiosError(error)) {
          // eslint-disable-next-line no-console
          console.log('useCheckToken', error.response?.data);
        }
        throw new Error('A megadott token nem érvényes.');
      }
    },
    enabled:
      isInternetReachable === true && isTokenSuccess && !!tokenData.token,
    staleTime: 300_000,
    retry: false,
  };
});

export { checkTokenAtom };
