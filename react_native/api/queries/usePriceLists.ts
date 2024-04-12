import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { getAndroidId } from 'expo-application';
import { useAtomValue } from 'jotai';

import { tokenAtom } from '../../atoms/token';
import env from '../../env.json';
import { queryKeys } from '../keys';
import {
  type PriceListResponseData,
  type PriceListResponseType,
} from '../response-types/PriceListResponseType';
import { useCheckToken } from './useCheckToken';

export function usePriceLists({
  enabled = true,
} = {}): UseQueryResult<PriceListResponseData> {
  const { data: user, isSuccess: isCheckTokenSuccess } = useCheckToken();
  const { token, isPasswordExpired, isTokenExpired } = useAtomValue(tokenAtom);

  const isRoundStarted = user?.state === 'R';

  return useQuery({
    queryKey: queryKeys.priceLists,
    queryFn: fetchPriceLists(token),
    enabled:
      enabled &&
      !isTokenExpired &&
      !!token &&
      isCheckTokenSuccess &&
      !isPasswordExpired &&
      isRoundStarted,
  });
}

export const fetchPriceLists =
  (token: string) => async (): Promise<PriceListResponseData> => {
    try {
      const response = await axios.get<PriceListResponseType>(
        `${env.api_url}/price_lists`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'X-Android-Id': getAndroidId(),
          },
        }
      );

      return response.data.data;
    } catch (error) {
      if (isAxiosError(error)) {
        // eslint-disable-next-line no-console
        console.log('usePriceLists:', error.response?.data);
      }
      throw new Error('Váratlan hiba lépett fel az árlisták lekérése során.');
    }
  };
