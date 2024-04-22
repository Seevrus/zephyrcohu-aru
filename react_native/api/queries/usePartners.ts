import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { getAndroidId } from 'expo-application';
import { useAtomValue } from 'jotai';

import { tokenAtom } from '../../atoms/token';
import { queryKeys } from '../keys';
import {
  mapPartnersResponse,
  type Partners,
} from '../response-mappers/mapPartnersResponse';
import { type PartnersResponseType } from '../response-types/PartnersResponseType';
import { useCheckToken } from './useCheckToken';

export function usePartners({ enabled = true } = {}): UseQueryResult<Partners> {
  const { data: user, isSuccess: isCheckTokenSuccess } = useCheckToken();
  const { token, isPasswordExpired, isTokenExpired } = useAtomValue(tokenAtom);

  const isRoundStarted = user?.state === 'R';

  return useQuery({
    queryKey: queryKeys.partners,
    queryFn: fetchPartners(token),
    enabled:
      enabled &&
      !isTokenExpired &&
      !!token &&
      isCheckTokenSuccess &&
      !isPasswordExpired &&
      isRoundStarted,
  });
}

export const fetchPartners = (token: string) => async (): Promise<Partners> => {
  try {
    const response = await axios.get<PartnersResponseType>(
      `${process.env.EXPO_PUBLIC_API_URL}/partners`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'X-Android-Id': getAndroidId(),
        },
      }
    );

    return mapPartnersResponse(response.data.data);
  } catch (error) {
    if (isAxiosError(error)) {
      // eslint-disable-next-line no-console
      console.log('usePartners:', error.response?.data);
    }
    throw new Error(
      'Váratlan hiba lépett fel a partnerek adatainak lekérése során.'
    );
  }
};
