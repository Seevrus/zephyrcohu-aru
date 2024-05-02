import { useNetInfo } from '@react-native-community/netinfo';
import { useQuery } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { useAtomValue } from 'jotai';
import { isNotNil } from 'ramda';

import { deviceIdAtom, tokenAtom } from '../../atoms/token';
import { queryKeys } from '../keys';
import {
  type PartnersListResponseData,
  type PartnersListResponseType,
} from '../response-types/PartnersListResponseType';
import { useCheckToken } from './useCheckToken';

export function usePartnerLists() {
  const { isInternetReachable } = useNetInfo();
  const { isSuccess: isCheckTokenSuccess } = useCheckToken();
  const { token, isPasswordExpired, isTokenExpired } = useAtomValue(tokenAtom);
  const deviceId = useAtomValue(deviceIdAtom);

  return useQuery({
    queryKey: queryKeys.partnerLists,
    queryFn: fetchPartnerLists(token, deviceId),
    enabled:
      isInternetReachable === true &&
      !isTokenExpired &&
      !isPasswordExpired &&
      !!token &&
      isNotNil(deviceId) &&
      isCheckTokenSuccess,
  });
}

export const fetchPartnerLists =
  (token: string, deviceId: string | null) =>
  async (): Promise<PartnersListResponseData> => {
    try {
      const response = await axios.get<PartnersListResponseType>(
        `${process.env.EXPO_PUBLIC_API_URL}/partner_lists`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
            'X-Android-Id': deviceId,
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
