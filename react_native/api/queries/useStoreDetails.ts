import { useNetInfo } from '@react-native-community/netinfo';
import { useQuery } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { useAtomValue } from 'jotai';
import { isNotNil } from 'ramda';

import { deviceIdAtom, tokenAtom } from '../../atoms/token';
import { queryKeys } from '../keys';
import {
  type StoreDetailsResponseData,
  type StoreDetailsResponseType,
} from '../response-types/StoreDetailsResponseType';
import { useCheckToken } from './useCheckToken';

export function useStoreDetails(
  storeId: number | null | undefined,
  enabled = true
) {
  const { isInternetReachable } = useNetInfo();
  const { isSuccess: isCheckTokenSuccess } = useCheckToken();
  const { token, isPasswordExpired, isTokenExpired } = useAtomValue(tokenAtom);
  const deviceId = useAtomValue(deviceIdAtom);

  return useQuery({
    queryKey: queryKeys.storeDetails(storeId),
    queryFn: fetchStoreDetails(token, deviceId, storeId as number),
    enabled:
      enabled &&
      isInternetReachable === true &&
      isNotNil(storeId) &&
      !isTokenExpired &&
      !isPasswordExpired &&
      isCheckTokenSuccess &&
      !!token &&
      isNotNil(deviceId),
  });
}

export const fetchStoreDetails =
  (token: string, deviceId: string | null, storeId: number) =>
  async (): Promise<StoreDetailsResponseData> => {
    try {
      const response = await axios.get<StoreDetailsResponseType>(
        `${process.env.EXPO_PUBLIC_API_URL}/stores/${storeId}`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'X-Device-Id': deviceId,
          },
        }
      );

      return response.data.data;
    } catch (error) {
      if (isAxiosError(error)) {
        // eslint-disable-next-line no-console
        console.log('useStoreDetails:', error.response?.data);
      }
      throw isAxiosError(error) && error.code === '404'
        ? new Error('A keresett raktár nem található.')
        : new Error(
            'Váratlan hiba lépett fel a raktár adatainak lekérése során.'
          );
    }
  };
