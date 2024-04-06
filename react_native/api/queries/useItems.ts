import { useNetInfo } from '@react-native-community/netinfo';
import { useQuery } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { useAtomValue } from 'jotai';

import { tokenAtom } from '../../atoms/token';
import env from '../../env.json';
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

  return useQuery({
    queryKey: queryKeys.items,
    queryFn: fetchItems(token),
    enabled:
      isInternetReachable === true &&
      !isTokenExpired &&
      !isPasswordExpired &&
      isCheckTokenSuccess &&
      !!token,
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
