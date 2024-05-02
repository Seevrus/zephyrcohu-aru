import { useNetInfo } from '@react-native-community/netinfo';
import { useQuery } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { useAtomValue } from 'jotai';
import { isNotNil } from 'ramda';

import { deviceIdAtom, tokenAtom } from '../../atoms/token';
import { queryKeys } from '../keys';
import {
  type StoresResponseData,
  type StoresResponseType,
} from '../response-types/StoresResponseType';
import { useCheckToken } from './useCheckToken';

export function useStores() {
  const { isInternetReachable } = useNetInfo();
  const { isSuccess: isCheckTokenSuccess } = useCheckToken();
  const { token, isPasswordExpired, isTokenExpired } = useAtomValue(tokenAtom);
  const deviceId = useAtomValue(deviceIdAtom);

  return useQuery({
    queryKey: queryKeys.stores,
    queryFn: fetchStores(token, deviceId),
    enabled:
      isInternetReachable === true &&
      !isTokenExpired &&
      !isPasswordExpired &&
      isCheckTokenSuccess &&
      !!token &&
      isNotNil(deviceId),
  });
}

export const fetchStores =
  (token: string, deviceId: string | null) =>
  async (): Promise<StoresResponseData> => {
    try {
      const response = await axios.get<StoresResponseType>(
        `${process.env.EXPO_PUBLIC_API_URL}/stores`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'X-Android-Id': deviceId,
          },
        }
      );

      return response.data.data;
    } catch (error) {
      if (isAxiosError(error)) {
        // eslint-disable-next-line no-console
        console.log('useStores', error.response?.data);
      }
      throw new Error(
        'Váratlan hiba lépett fel a raktárak adatainak lekérése során.'
      );
    }
  };
