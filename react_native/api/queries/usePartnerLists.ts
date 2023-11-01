import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';

import env from '../../env.json';
import {
  type PartnersListResponseData,
  type PartnersListResponseType,
} from '../response-types/PartnersListResponseType';
import { useCheckToken } from './useCheckToken';
import { useToken } from './useToken';

export function usePartnerLists({
  enabled = true,
} = {}): UseQueryResult<PartnersListResponseData> {
  const { isSuccess: isCheckTokenSuccess } = useCheckToken();
  const { data: { isPasswordExpired, isTokenExpired, token } = {} } =
    useToken();

  return useQuery({
    queryKey: ['partner-lists'],
    queryFn: async (): Promise<PartnersListResponseData> => {
      try {
        const response = await axios.get<PartnersListResponseType>(
          `${env.api_url}/partner_lists`,
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
          console.log('usePartnerLists:', error.response?.data);
        }
        throw new Error(
          'Váratlan hiba lépett fel a partnerlisták lekérése során.'
        );
      }
    },
    enabled:
      enabled &&
      !isTokenExpired &&
      !!token &&
      isCheckTokenSuccess &&
      !isPasswordExpired,
    initialData: [],
  });
}
