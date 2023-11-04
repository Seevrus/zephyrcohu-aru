import { useNetInfo } from '@react-native-community/netinfo';
import { useQuery } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { isNotNil } from 'ramda';

import env from '../../env.json';
import {
  type StoreDetailsResponseData,
  type StoreDetailsResponseType,
} from '../response-types/StoreDetailsResponseType';
import { useCheckToken } from './useCheckToken';
import { useToken } from './useToken';

export function useStoreDetails(storeId: number | undefined, enabled: boolean) {
  const { isInternetReachable } = useNetInfo();
  const { isSuccess: isCheckTokenSuccess } = useCheckToken();
  const { isSuccess: isTokenSuccess, data: tokenData } = useToken();

  return useQuery({
    queryKey: ['store-details', storeId],
    queryFn: fetchStoreDetails(tokenData?.token as string, storeId as number),
    enabled:
      enabled &&
      isInternetReachable === true &&
      isNotNil(storeId) &&
      isTokenSuccess &&
      !tokenData.isTokenExpired &&
      !tokenData.isPasswordExpired &&
      isCheckTokenSuccess &&
      !!tokenData.token,
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
