import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetInfo } from '@react-native-community/netinfo';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { equals } from 'ramda';
import { useEffect, useState } from 'react';

import env from '../../env.json';
import mapCheckTokenResponse, { CheckToken } from '../response-mappers/mapCheckTokenResponse';
import { LoginResponse } from '../response-types/LoginResponseType';
import useToken from './useToken';

function useCheckTokenQuery({ enabled = true } = {}) {
  const { isInternetReachable } = useNetInfo();
  const { isSuccess: isTokenSuccess, data: { token } = {} } = useToken();

  return useQuery({
    queryKey: ['check-token'],
    queryFn: async (): Promise<CheckToken> => {
      try {
        const response = await axios.get<LoginResponse>(`${env.api_url}/users/check-token`, {
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        });

        return mapCheckTokenResponse(response.data);
      } catch (err) {
        console.log(err.message);
        throw new Error('A megadott token nem érvényes.');
      }
    },
    enabled: isInternetReachable === true && enabled && isTokenSuccess && !!token,
    staleTime: 300_000,
    retry: false,
  });
}

export default function useCheckToken({ enabled = true } = {}) {
  const checkTokenResult = useCheckTokenQuery({ enabled });
  const { isInternetReachable } = useNetInfo();
  const queryClient = useQueryClient();

  const [user, setUser] = useState<CheckToken>(null);

  useEffect(() => {
    if (checkTokenResult.isError) {
      AsyncStorage.getItem('boreal-user-backup').then((backup) => {
        if (backup) {
          const backupUser = JSON.parse(backup);
          setUser(backupUser);
        }
      });
    }
  }, [checkTokenResult.isError]);

  useEffect(() => {
    if (checkTokenResult.isSuccess && !equals(user, checkTokenResult.data)) {
      AsyncStorage.setItem('boreal-user-backup', JSON.stringify(checkTokenResult.data)).then(() => {
        setUser(checkTokenResult.data);
        if (isInternetReachable === true) {
          queryClient.invalidateQueries({ queryKey: ['stores'] });
        }
      });
    }
  }, [checkTokenResult.data, checkTokenResult.isSuccess, isInternetReachable, queryClient, user]);

  return {
    data: user,
    isFetching: checkTokenResult.isFetching,
    isPending: checkTokenResult.isPending,
  };
}
