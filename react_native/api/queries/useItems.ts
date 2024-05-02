import { useNetInfo } from '@react-native-community/netinfo';
import { useQuery } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { useAtomValue } from 'jotai';
import { isNotNil } from 'ramda';

import { deviceIdAtom, tokenAtom } from '../../atoms/token';
import { queryKeys } from '../keys';
import {
  type ItemsResponseData,
  type ItemsResponseType,
} from '../response-types/ItemsResponseType';
import { useCheckToken } from './useCheckToken';

export function useItems() {
  const { isInternetReachable } = useNetInfo();
  const { isSuccess: isCheckTokenSuccess } = useCheckToken();
  const { token, isPasswordExpired, isTokenExpired } = useAtomValue(tokenAtom);
  const deviceId = useAtomValue(deviceIdAtom);

  return useQuery({
    queryKey: queryKeys.items,
    queryFn: fetchItems(token, deviceId),
    enabled:
      isInternetReachable === true &&
      !isTokenExpired &&
      !isPasswordExpired &&
      isCheckTokenSuccess &&
      !!token &&
      isNotNil(deviceId),
  });
}

export const fetchItems =
  (token: string, deviceId: string | null) =>
  async (): Promise<ItemsResponseData> => {
    try {
      const response = await axios.get<ItemsResponseType>(
        `${process.env.EXPO_PUBLIC_API_URL}/items`,
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
        console.log('useItems:', error.response?.data);
      }
      throw new Error(
        'Váratlan hiba lépett fel a tételek adatainak lekérése során.'
      );
    }
  };
