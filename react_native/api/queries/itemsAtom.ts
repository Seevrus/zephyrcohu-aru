import axios, { isAxiosError } from 'axios';
import { atomsWithQueryAsync } from 'jotai-tanstack-query';

import { netInfoAtom } from '../../atoms/helpers';
import env from '../../env.json';
import {
  type ItemsResponseData,
  type ItemsResponseType,
} from '../response-types/ItemsResponseType';
import { checkTokenAtom } from './checkTokenAtom';
import { tokenAtom } from './tokenAtom';

const [, itemsAtom] = atomsWithQueryAsync(async (get) => {
  const isInternetReachable = await get(netInfoAtom);
  const { isSuccess: isCheckTokenSuccess } = await get(checkTokenAtom);
  const { isSuccess: isTokenSuccess, data: tokenData } = get(tokenAtom);

  return {
    queryKey: ['items'],
    queryFn: async (): Promise<ItemsResponseData> => {
      try {
        const response = await axios.get<ItemsResponseType>(
          `${env.api_url}/items`,
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
          console.log('useItems:', error.response?.data);
        }
        throw new Error(
          'Váratlan hiba lépett fel a tételek adatainak lekérése során.'
        );
      }
    },
    enabled:
      isInternetReachable === true &&
      isTokenSuccess &&
      !tokenData.isTokenExpired &&
      !tokenData.isPasswordExpired &&
      isCheckTokenSuccess &&
      !!tokenData.token,
  };
});

export { itemsAtom };
