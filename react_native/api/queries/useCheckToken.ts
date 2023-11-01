import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetInfo } from '@react-native-community/netinfo';
import { useQuery } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { equals, isEmpty, not } from 'ramda';
import { useEffect, useRef } from 'react';

import env from '../../env.json';
import {
  mapCheckTokenResponse,
  type CheckToken,
} from '../response-mappers/mapCheckTokenResponse';
import { type LoginResponse } from '../response-types/LoginResponseType';
import { useToken } from './useToken';

function useCheckTokenQuery({ enabled = true } = {}) {
  const { isInternetReachable } = useNetInfo();
  const { isSuccess: isTokenSuccess, data: { token } = {} } = useToken();

  return useQuery({
    queryKey: ['check-token', token],
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
        }
        throw new Error('A megadott token nem érvényes.');
      }
    },
    enabled:
      isInternetReachable === true && enabled && isTokenSuccess && !!token,
    staleTime: 300_000,
    retry: false,
  });
}

export function useCheckToken({ enabled = true } = {}) {
  const checkTokenResult = useCheckTokenQuery({ enabled });
  const { isInternetReachable } = useNetInfo();

  const user = useRef<CheckToken>(null);

  useEffect(() => {
    if (checkTokenResult.isError) {
      AsyncStorage.getItem('boreal-user-backup').then((backup) => {
        if (backup) {
          const backupUser = JSON.parse(backup);
          user.current = backupUser;
        }
      });
    }
  }, [checkTokenResult.isError]);

  useEffect(() => {
    if (
      checkTokenResult.isSuccess &&
      not(isEmpty(checkTokenResult.data)) &&
      !equals(user.current, checkTokenResult.data)
    ) {
      AsyncStorage.setItem(
        'boreal-user-backup',
        JSON.stringify(checkTokenResult.data)
      ).then(() => {
        user.current = checkTokenResult.data;
      });
    }
  }, [checkTokenResult.data, checkTokenResult.isSuccess, isInternetReachable]);

  return {
    data: user.current,
    isFetching: checkTokenResult.isFetching,
    isPending: checkTokenResult.isPending,
    isSuccess: checkTokenResult.isSuccess,
  };
}
