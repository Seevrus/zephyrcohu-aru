import axios, { isAxiosError } from 'axios';

import { useNetInfo } from '@react-native-community/netinfo';
import { useQuery } from '@tanstack/react-query';
import env from '../../env.json';
import {
  type PartnersListResponseData,
  type PartnersListResponseType,
} from '../response-types/PartnersListResponseType';
import { useCheckToken } from './useCheckToken';
import { useToken } from './useToken';

export function usePartnerLists() {
  const { isInternetReachable } = useNetInfo();
  const { isSuccess: isCheckTokenSuccess } = useCheckToken();
  const { isSuccess: isTokenSuccess, data: tokenData } = useToken();

  return useQuery({
    queryKey: ['partner-lists'],
    queryFn: fetchPartnerLists(tokenData?.token as string),
    enabled:
      isInternetReachable === true &&
      isTokenSuccess &&
      !tokenData.isTokenExpired &&
      !tokenData.isPasswordExpired &&
      !!tokenData.token &&
      isCheckTokenSuccess,
  });
}

export const fetchPartnerLists =
  (token: string) => async (): Promise<PartnersListResponseData> => {
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
  };
