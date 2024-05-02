import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { useAtomValue } from 'jotai';
import { isNotNil } from 'ramda';

import { deviceIdAtom, tokenAtom } from '../../atoms/token';
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
  const deviceId = useAtomValue(deviceIdAtom);

  const isRoundStarted = user?.state === 'R';

  return useQuery({
    queryKey: queryKeys.priceLists,
    queryFn: fetchPriceLists(token, deviceId),
    enabled:
      enabled &&
      !isTokenExpired &&
      !!token &&
      isNotNil(deviceId) &&
      isCheckTokenSuccess &&
      !isPasswordExpired &&
      isRoundStarted,
  });
}

export const fetchPriceLists =
  (token: string, deviceId: string | null) =>
  async (): Promise<PriceListResponseData> => {
    try {
      const response = await axios.get<PriceListResponseType>(
        `${process.env.EXPO_PUBLIC_API_URL}/price_lists`,
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
        console.log('usePriceLists:', error.response?.data);
      }
      throw new Error('Váratlan hiba lépett fel az árlisták lekérése során.');
    }
  };
