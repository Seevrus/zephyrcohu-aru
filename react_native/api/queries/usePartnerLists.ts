import axios, { isAxiosError } from 'axios';
import { atomsWithQueryAsync } from 'jotai-tanstack-query';

import { netInfoAtom } from '../../atoms/helpers';
import env from '../../env.json';
import {
  type PartnersListResponseData,
  type PartnersListResponseType,
} from '../response-types/PartnersListResponseType';
import { tokenAtom } from './useToken';
import { checkTokenAtom } from './useCheckToken';

export const [, partnerListsAtom] = atomsWithQueryAsync(async (get) => {
  const isInternetReachable = await get(netInfoAtom);
  const { data: user } = await get(checkTokenAtom);
  const { isSuccess: isTokenSuccess, data: tokenData } = get(tokenAtom);

  const isRoundStarted = user?.state === 'R';

  return {
    queryKey: ['partner-lists'],
    queryFn: async (): Promise<PartnersListResponseData> => {
      try {
        const response = await axios.get<PartnersListResponseType>(
          `${env.api_url}/partner_lists`,
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
          console.log('usePartnerLists:', error.response?.data);
        }
        throw new Error(
          'Váratlan hiba lépett fel a partnerlisták lekérése során.'
        );
      }
    },
    enabled:
      isInternetReachable === true &&
      isTokenSuccess &&
      !tokenData.isTokenExpired &&
      !tokenData.isPasswordExpired &&
      !!tokenData.token &&
      isRoundStarted,
  };
});
