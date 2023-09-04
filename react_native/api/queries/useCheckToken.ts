import { useNetInfo } from '@react-native-community/netinfo';
import { UseQueryResult, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect } from 'react';

import env from '../../env.json';
import useLogout from '../mutations/useLogout';
import mapCheckTokenResponse, { CheckToken } from '../response-mappers/mapCheckTokenResponse';
import { LoginResponse } from '../response-types/LoginResponseType';
import useToken from './useToken';

function useCheckTokenQuery({ enabled = true } = {}): UseQueryResult<CheckToken> {
  const { isInternetReachable } = useNetInfo();
  const { isSuccess: isTokenSuccess, data: { token } = {} } = useToken();

  return useQuery({
    queryKey: ['check-token', token],
    queryFn: async () => {
      try {
        const response = await axios.get<LoginResponse>(`${env.api_url}/users/check-token`, {
          headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
        });

        return mapCheckTokenResponse(response.data);
      } catch (err) {
        throw new Error('A megadott token nem érvényes.');
      }
    },
    enabled: isInternetReachable === true && enabled && isTokenSuccess && !!token,
    staleTime: 0,
  });
}

export default function useCheckToken({ enabled = true } = {}): UseQueryResult<CheckToken> {
  const checkTokenResult = useCheckTokenQuery({ enabled });
  const { mutateAsync: logout } = useLogout();

  useEffect(() => {
    async function logoutOnError() {
      if (checkTokenResult.isError) {
        await logout();
      }
    }

    logoutOnError();
  }, [checkTokenResult.isError, logout]);

  return checkTokenResult;
}
