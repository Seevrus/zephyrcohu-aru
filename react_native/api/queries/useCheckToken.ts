import { useNetInfo } from '@react-native-community/netinfo';
import axios, { isAxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';

import env from '../../env.json';
import { queryClient } from '../queryClient';
import {
  mapCheckTokenResponse,
  type CheckToken,
} from '../response-mappers/mapCheckTokenResponse';
import { type LoginResponse } from '../response-types/LoginResponseType';
import { useToken } from './useToken';
import { useQuery } from '@tanstack/react-query';

export function useCheckToken() {
  const { isInternetReachable } = useNetInfo();
  const { isSuccess: isTokenSuccess, data: tokenData } = useToken();

  return useQuery({
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

          if (error.response?.status === 401) {
            await queryClient.invalidateQueries({ queryKey: ['token'] });
            await SecureStore.deleteItemAsync('boreal-token');
          }
        }

        throw new Error('A megadott token nem érvényes.');
      }
    },
    enabled:
      isInternetReachable === true && isTokenSuccess && !!tokenData.token,
    staleTime: 300_000,
    retry: false,
  });
}
