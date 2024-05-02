import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { useAtomValue } from 'jotai';
import { isNotNil } from 'ramda';

import { deviceIdAtom, tokenAtom } from '../../atoms/token';
import { queryKeys } from '../keys';
import {
  type OtherItemsResponseData,
  type OtherItemsResponseType,
} from '../response-types/OtherItemsResponseType';
import { useCheckToken } from './useCheckToken';

export function useOtherItems({
  enabled = true,
} = {}): UseQueryResult<OtherItemsResponseData> {
  const { data: user, isSuccess: isCheckTokenSuccess } = useCheckToken();
  const { token, isPasswordExpired, isTokenExpired } = useAtomValue(tokenAtom);
  const deviceId = useAtomValue(deviceIdAtom);

  const isRoundStarted = user?.state === 'R';

  return useQuery({
    queryKey: queryKeys.otherItems,
    queryFn: fetchOtherItems(token, deviceId),
    enabled:
      enabled &&
      !isTokenExpired &&
      !!token &&
      isNotNil(deviceId) &&
      isCheckTokenSuccess &&
      !isPasswordExpired &&
      isRoundStarted,
  });
}

export const fetchOtherItems =
  (token: string, deviceId: string | null) =>
  async (): Promise<OtherItemsResponseData> => {
    try {
      const response = await axios.get<OtherItemsResponseType>(
        `${process.env.EXPO_PUBLIC_API_URL}/other_items`,
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
        console.log('useOtherItems:', error.response?.data);
      }
      throw new Error(
        'Váratlan hiba lépett fel az egyéb tételek adatainak lekérése során.'
      );
    }
  };
