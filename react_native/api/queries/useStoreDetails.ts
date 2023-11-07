import { useNetInfo } from '@react-native-community/netinfo';
import { useQuery } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { useAtomValue } from 'jotai';
import { isNotNil } from 'ramda';

import { tokenAtom } from '../../atoms/token';
import env from '../../env.json';
import {
  type StoreDetailsResponseData,
  type StoreDetailsResponseType,
} from '../response-types/StoreDetailsResponseType';
import { useCheckToken } from './useCheckToken';

export function useStoreDetails(storeId: number | undefined, enabled = true) {
  const { isInternetReachable } = useNetInfo();
  const { isSuccess: isCheckTokenSuccess } = useCheckToken();
  const { token, isPasswordExpired, isTokenExpired } = useAtomValue(tokenAtom);

  return useQuery({
    queryKey: ['store-details', storeId],
    queryFn: fetchStoreDetails(token, storeId as number),
    enabled:
      enabled &&
      isInternetReachable === true &&
      isNotNil(storeId) &&
      !isTokenExpired &&
      !isPasswordExpired &&
      isCheckTokenSuccess &&
      !!token,
  });
}

export const fetchStoreDetails =
  (token: string, storeId: number) =>
  async (): Promise<StoreDetailsResponseData> => {
    try {
      const response = await axios.get<StoreDetailsResponseType>(
        `${env.api_url}/stores/${storeId}`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
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
