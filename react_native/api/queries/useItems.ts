import axios, { isAxiosError } from 'axios';
import { useNetInfo } from '@react-native-community/netinfo';

import env from '../../env.json';
import {
  type ItemsResponseData,
  type ItemsResponseType,
} from '../response-types/ItemsResponseType';
import { useCheckToken } from './useCheckToken';
import { useToken } from './useToken';
import { useQuery } from '@tanstack/react-query';

export function useItems() {
  const { isInternetReachable } = useNetInfo();
  const { isSuccess: isCheckTokenSuccess } = useCheckToken();
  const { isSuccess: isTokenSuccess, data: tokenData } = useToken();

  return useQuery({
    queryKey: ['items'],
    queryFn: fetchItems(tokenData?.token as string),
    enabled:
      isInternetReachable === true &&
      isTokenSuccess &&
      !tokenData.isTokenExpired &&
      !tokenData.isPasswordExpired &&
      isCheckTokenSuccess &&
      !!tokenData.token,
  });
}

export const fetchItems =
  (token: string) => async (): Promise<ItemsResponseData> => {
    try {
      const response = await axios.get<ItemsResponseType>(
        `${env.api_url}/items`,
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
        console.log('useItems:', error.response?.data);
      }
      throw new Error(
        'Váratlan hiba lépett fel a tételek adatainak lekérése során.'
      );
    }
  };
