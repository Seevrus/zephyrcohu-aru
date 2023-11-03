import axios, { isAxiosError } from 'axios';
import { atomsWithQueryAsync } from 'jotai-tanstack-query';

import { netInfoAtom } from '../../atoms/helpers';
import env from '../../env.json';
import {
  type StoresResponseData,
  type StoresResponseType,
} from '../response-types/StoresResponseType';
import { checkTokenAtom } from './checkTokenAtom';
import { tokenAtom } from './tokenAtom';

const [, storesAtom] = atomsWithQueryAsync(async (get) => {
  const isInternetReachable = await get(netInfoAtom);
  const { isSuccess: isCheckTokenSuccess } = await get(checkTokenAtom);
  const { isSuccess: isTokenSuccess, data: tokenData } = get(tokenAtom);

  return {
    queryKey: ['stores'],
    queryFn: async (): Promise<StoresResponseData> => {
      try {
        const response = await axios.get<StoresResponseType>(
          `${env.api_url}/stores`,
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
          console.log('useStores', error.response?.data);
        }
        throw new Error(
          'Váratlan hiba lépett fel a raktárak adatainak lekérése során.'
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

export { storesAtom };
