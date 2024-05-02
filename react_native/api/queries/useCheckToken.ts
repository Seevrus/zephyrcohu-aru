import { useNetInfo } from '@react-native-community/netinfo';
import { useQuery } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { useAtom, useAtomValue } from 'jotai';
import { isNotNil } from 'ramda';

import {
  defaultStoredToken,
  deviceIdAtom,
  storedTokenAtom,
  tokenAtom,
} from '../../atoms/token';
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
  const deviceId = useAtomValue(deviceIdAtom);

  return useQuery({
    queryKey: queryKeys.checkToken,
    async queryFn(): Promise<CheckToken> {
      try {
        const user = await axios.get<LoginResponse>(
          `${process.env.EXPO_PUBLIC_API_URL}/users/check-token`,
          {
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${token}`,
              'X-Device-Id': deviceId,
            },
          }
        );

        const isPasswordExpired = user.data.token.abilities.includes(
          'password' as never
        );

        if (isPasswordExpired) {
          await setStoredToken(async (prevToken) => ({
            ...(await prevToken),
            isPasswordExpired: true,
          }));
        }

        return mapCheckTokenResponse(user.data);
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
    enabled: isInternetReachable === true && !!token && isNotNil(deviceId),
    staleTime: 1 * 60 * 60 * 1000,
  });
}
