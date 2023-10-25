import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetInfo } from '@react-native-community/netinfo';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
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
    async function getBackupUserData() {
      const backup = await AsyncStorage.getItem('boreal-user-backup');
      if (backup) {
        const backupUser = JSON.parse(backup);
        setUser(backupUser);
      }
    }

    if (checkTokenResult.isError) {
      getBackupUserData();
    }
  }, [checkTokenResult.isError]);

  useEffect(() => {
    if (isInternetReachable === true && checkTokenResult.isSuccess) {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    }
  }, [checkTokenResult.isSuccess, isInternetReachable, queryClient]);

  useEffect(() => {
    async function setBackupData() {
      await AsyncStorage.setItem('boreal-user-backup', JSON.stringify(checkTokenResult.data));
    }

    if (checkTokenResult.isSuccess) {
      setBackupData();
      setUser(checkTokenResult.data);
    }
  }, [checkTokenResult.data, checkTokenResult.isSuccess]);

  return {
    data: user,
    isFetching: checkTokenResult.isFetching,
    isPending: checkTokenResult.isPending,
  };
}
