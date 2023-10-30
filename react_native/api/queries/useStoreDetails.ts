import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { isNil } from 'ramda';

import env from '../../env.json';
import {
  type StoreDetailsResponseData,
  type StoreDetailsResponseType,
} from '../response-types/StoreDetailsResponseType';
import { useToken } from './useToken';

type UseStoreDetails = {
  storeId: number | null | undefined;
  enabled?: boolean;
};

export function useStoreDetails({
  storeId,
  enabled = true,
}: UseStoreDetails): UseQueryResult<StoreDetailsResponseData> {
  const {
    isSuccess: isTokenSuccess,
    data: { token, isTokenExpired, isPasswordExpired } = {},
  } = useToken();

  return useQuery({
    queryKey: ['store-details', storeId],
    queryFn: async () => {
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
      } catch (error_) {
        throw isAxiosError(error_) && error_.code === '404'
          ? new Error('A keresett raktár nem található.')
          : new Error(
              'Váratlan hiba lépett fel a raktár adatainak lekérése során.'
            );
      }
    },
    enabled:
      enabled &&
      !isNil(storeId) &&
      isTokenSuccess &&
      !(isTokenExpired || isPasswordExpired),
  });
}
