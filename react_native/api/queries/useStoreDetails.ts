import { UseQueryResult, useQuery } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';

import { isNil } from 'ramda';
import env from '../../env.json';
import {
  StoreDetailsResponseData,
  StoreDetailsResponseType,
} from '../response-types/StoreDetailsResponseType';
import useToken from './useToken';

type UseStoreDetails = {
  storeId: number | null | undefined;
  enabled?: boolean;
};

export default function useStoreDetails({
  storeId,
  enabled = true,
}: UseStoreDetails): UseQueryResult<StoreDetailsResponseData> {
  const { isSuccess: isTokenSuccess, data: { token, isTokenExpired, isPasswordExpired } = {} } =
    useToken();

  return useQuery({
    queryKey: ['store-details', storeId],
    queryFn: async () => {
      try {
        const response = await axios.get<StoreDetailsResponseType>(
          `${env.api_url}/stores/${storeId}`,
          {
            headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
          }
        );

        return response.data.data;
      } catch (err) {
        if (isAxiosError(err) && err.code === '404') {
          throw new Error('A keresett raktár nem található.');
        } else {
          throw new Error('Váratlan hiba lépett fel a raktár adatainak lekérése során.');
        }
      }
    },
    enabled: enabled && !isNil(storeId) && isTokenSuccess && !(isTokenExpired || isPasswordExpired),
  });
}
