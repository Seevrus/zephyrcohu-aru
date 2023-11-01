import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { isNil } from 'ramda';

import env from '../../env.json';
import {
  type StoreDetailsResponseData,
  type StoreDetailsResponseType,
} from '../response-types/StoreDetailsResponseType';
import { useCheckToken } from './useCheckToken';
import { useToken } from './useToken';

type UseStoreDetails = {
  storeId: number | null | undefined;
  enabled?: boolean;
};

export function useStoreDetails({
  storeId,
  enabled = true,
}: UseStoreDetails): UseQueryResult<StoreDetailsResponseData> {
  const { isSuccess: isCheckTokenSuccess } = useCheckToken();
  const { data: { token, isPasswordExpired } = {} } = useToken();

  return useQuery({
    queryKey: ['store-details', storeId],
    queryFn: async (): Promise<StoreDetailsResponseData> => {
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
    },
    enabled:
      enabled && !isNil(storeId) && isCheckTokenSuccess && !isPasswordExpired,
    initialData: {} as StoreDetailsResponseData,
  });
}
