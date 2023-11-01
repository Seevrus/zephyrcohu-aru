import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';

import env from '../../env.json';
import {
  type PriceListResponseData,
  type PriceListResponseType,
} from '../response-types/PriceListResponseType';
import { useCheckToken } from './useCheckToken';
import { useToken } from './useToken';

export function usePriceLists({
  enabled = true,
} = {}): UseQueryResult<PriceListResponseData> {
  const { data: user, isSuccess: isCheckTokenSuccess } = useCheckToken();
  const { data: { isPasswordExpired, token } = {} } = useToken();

  const isRoundStarted = user?.state === 'R';

  return useQuery({
    queryKey: ['price-lists'],
    queryFn: async (): Promise<PriceListResponseData> => {
      try {
        const response = await axios.get<PriceListResponseType>(
          `${env.api_url}/price_lists`,
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
          console.log('usePriceLists:', error.response?.data);
        }
        throw new Error('Váratlan hiba lépett fel az árlisták lekérése során.');
      }
    },
    enabled:
      enabled && isCheckTokenSuccess && !isPasswordExpired && isRoundStarted,
  });
}
