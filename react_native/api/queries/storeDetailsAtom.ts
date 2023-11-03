import axios, { isAxiosError } from 'axios';
import { atomsWithQueryAsync } from 'jotai-tanstack-query';
import { isNil } from 'ramda';

import { netInfoAtom } from '../../atoms/helpers';
import env from '../../env.json';
import {
  type StoreDetailsResponseData,
  type StoreDetailsResponseType,
} from '../response-types/StoreDetailsResponseType';
import { checkTokenAtom } from './checkTokenAtom';
import { tokenAtom } from './tokenAtom';

const getStoreDetailsAtom = (storeId: number | undefined) =>
  atomsWithQueryAsync(async (get) => {
    const isInternetReachable = await get(netInfoAtom);
    const { isSuccess: isCheckTokenSuccess } = await get(checkTokenAtom);
    const { isSuccess: isTokenSuccess, data: tokenData } = get(tokenAtom);

    return {
      queryKey: ['store-details', storeId],
      queryFn: async (): Promise<StoreDetailsResponseData> => {
        try {
          const response = await axios.get<StoreDetailsResponseType>(
            `${env.api_url}/stores/${storeId}`,
            {
              headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${tokenData?.token}`,
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
        isInternetReachable === true &&
        !isNil(storeId) &&
        isTokenSuccess &&
        !tokenData.isTokenExpired &&
        !tokenData.isPasswordExpired &&
        isCheckTokenSuccess &&
        !!tokenData.token,
    };
  })[1];

export { getStoreDetailsAtom };
